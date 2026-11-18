import sys, struct

CONTAINERS = {b'moov', b'trak', b'mdia', b'minf', b'stbl', b'mvex', b'edts', b'dinf'}

def walk(buf, start, end, depth=0, out=None):
    pos = start
    while pos + 8 <= end:
        size = struct.unpack('>I', buf[pos:pos+4])[0]
        typ = buf[pos+4:pos+8]
        hdr = 8
        if size == 1:
            size = struct.unpack('>Q', buf[pos+8:pos+16])[0]
            hdr = 16
        elif size == 0:
            size = end - pos
        if size < hdr:
            break
        body = pos + hdr
        out.append((depth, typ, body, size - hdr))
        if typ in CONTAINERS:
            walk(buf, body, pos + size, depth + 1, out)
        pos += size
    return out

def main(path):
    buf = open(path, 'rb').read()
    boxes = walk(buf, 0, len(buf), 0, [])
    names = []
    tracks = 0
    for depth, typ, body, ln in boxes:
        names.append(('  ' * depth) + typ.decode('latin1'))
    print('\n'.join(names))
    print('--- tracks ---')
    # locate each trak, then hdlr + mdhd + stsd codec
    for depth, typ, body, ln in boxes:
        if typ == b'trak' and depth == 1:
            tracks += 1
            hdl, mdhd, codec, stsz_samples, stts = None, None, None, None, None
            sub = walk(buf, body, body + ln, 0, [])
            for d, t, b, l in sub:
                if t == b'hdlr':
                    hdl = buf[b+8:b+12].decode('latin1')
                if t == b'mdhd':
                    ver = buf[b]
                    if ver == 1:
                        timescale, duration = struct.unpack('>IQ', buf[b+20:b+32])
                    else:
                        timescale, duration = struct.unpack('>II', buf[b+12:b+20])
                    mdhd = (timescale, duration)
                if t == b'stsd':
                    codec = buf[b+12:b+16].decode('latin1')
                if t == b'stsz':
                    count = struct.unpack('>I', buf[b+8:b+12])[0]
                    stsz_samples = count
                if t == b'stts':
                    n = struct.unpack('>I', buf[b+4:b+8])[0]
                    ents = [struct.unpack('>II', buf[b+8+8*i:b+16+8*i]) for i in range(n)]
                    stts = ents
            print(f'track {tracks}: handler={hdl} codec={codec} timescale={mdhd[0] if mdhd else None} '
                  f'duration={mdhd[1] if mdhd else None} '
                  f'samples={stsz_samples} stts={stts[:3]}')

main(sys.argv[1])
