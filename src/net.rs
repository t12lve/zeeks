//! Téléchargement d'une image par URL via WinHTTP (TLS géré par Windows).

use std::ffi::c_void;

use anyhow::{bail, Context, Result};
use windows::core::PCWSTR;
use windows::Win32::Networking::WinHttp::*;

const MAX_BYTES: usize = 256 * 1024 * 1024;

struct Handle(*mut c_void);

impl Drop for Handle {
    fn drop(&mut self) {
        unsafe {
            let _ = WinHttpCloseHandle(self.0);
        }
    }
}

fn wide(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}

fn parse(url: &str) -> Result<(bool, String, u16, String)> {
    let url = url.trim();
    let (secure, rest) = if let Some(r) = url.strip_prefix("https://") {
        (true, r)
    } else if let Some(r) = url.strip_prefix("http://") {
        (false, r)
    } else {
        bail!("L'URL doit commencer par http:// ou https://");
    };
    let (authority, path) = match rest.find(['/', '?']) {
        Some(i) => (&rest[..i], &rest[i..]),
        None => (rest, "/"),
    };
    let default_port = if secure { 443 } else { 80 };
    let (host, port) = match authority.rsplit_once(':') {
        Some((h, p)) => (h.to_string(), p.parse::<u16>().unwrap_or(default_port)),
        None => (authority.to_string(), default_port),
    };
    if host.is_empty() {
        bail!("URL invalide");
    }
    Ok((secure, host, port, path.to_string()))
}

pub fn fetch(url: &str) -> Result<Vec<u8>> {
    let (secure, host, port, path) = parse(url)?;
    unsafe {
        let agent = wide("Audio2Video/1.0");
        let session = WinHttpOpen(
            PCWSTR(agent.as_ptr()),
            WINHTTP_ACCESS_TYPE_AUTOMATIC_PROXY,
            PCWSTR::null(),
            PCWSTR::null(),
            0,
        );
        if session.is_null() {
            bail!("Impossible d'initialiser la connexion réseau.");
        }
        let session = Handle(session);
        let _ = WinHttpSetTimeouts(session.0, 10_000, 10_000, 30_000, 60_000);

        let host_w = wide(&host);
        let conn = WinHttpConnect(session.0, PCWSTR(host_w.as_ptr()), port, 0);
        if conn.is_null() {
            bail!("Hôte introuvable : {host}");
        }
        let conn = Handle(conn);

        let verb = wide("GET");
        let object = wide(&path);
        let flags = if secure {
            WINHTTP_FLAG_SECURE
        } else {
            WINHTTP_OPEN_REQUEST_FLAGS(0)
        };
        let request = WinHttpOpenRequest(
            conn.0,
            PCWSTR(verb.as_ptr()),
            PCWSTR(object.as_ptr()),
            PCWSTR::null(),
            PCWSTR::null(),
            std::ptr::null(),
            flags,
        );
        if request.is_null() {
            bail!("Requête impossible.");
        }
        let request = Handle(request);

        WinHttpSendRequest(request.0, None, None, 0, 0, 0)
            .with_context(|| format!("Connexion à {host} impossible"))?;
        WinHttpReceiveResponse(request.0, std::ptr::null_mut())
            .context("Aucune réponse du serveur")?;

        let mut code: u32 = 0;
        let mut len = std::mem::size_of::<u32>() as u32;
        WinHttpQueryHeaders(
            request.0,
            WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER,
            PCWSTR::null(),
            Some(&mut code as *mut u32 as *mut c_void),
            &mut len,
            std::ptr::null_mut(),
        )?;
        if code != 200 {
            bail!("Le site a répondu {code} (le fichier n'est peut-être pas accessible).");
        }

        let mut out: Vec<u8> = Vec::new();
        let mut buf = vec![0u8; 64 * 1024];
        loop {
            let mut read = 0u32;
            WinHttpReadData(
                request.0,
                buf.as_mut_ptr() as *mut c_void,
                buf.len() as u32,
                &mut read,
            )
            .context("Lecture interrompue")?;
            if read == 0 {
                break;
            }
            out.extend_from_slice(&buf[..read as usize]);
            if out.len() > MAX_BYTES {
                bail!("Fichier trop volumineux (max 256 Mo).");
            }
        }
        if out.is_empty() {
            bail!("Le téléchargement n'a rien renvoyé.");
        }
        Ok(out)
    }
}
