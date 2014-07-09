define ()->
  # FNV32A Hashing algorithm
  # original implementation: https://gist.github.com/vaiorabbit/5657561
  hash: (str)->
    FNV1_32A_INIT = 0x811c9dc5
    hval = FNV1_32A_INIT
    for i in str.length
      hval ^= str.charCodeAt(i)
      hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
    hval >>> 0

