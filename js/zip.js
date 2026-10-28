/* Build Your AI — zip.js
 * A tiny, dependency-free zip writer (store only, no compression) so the
 * Claude Skill can be downloaded as a ready-to-upload .zip. Text files only.
 * Shared via window.BYAI.
 */
(function (BYAI) {
  "use strict";

  var CRC_TABLE = (function () {
    var table = [];
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table.push(c >>> 0);
    }
    return table;
  })();

  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  // files: [{ path: "folder/SKILL.md", text: "..." }] -> Blob
  BYAI.makeZip = function (files) {
    var enc = new TextEncoder();
    var now = new Date();
    var dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    var dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    var parts = [], central = [], offset = 0;

    files.forEach(function (f) {
      var name = enc.encode(f.path);
      var data = enc.encode(f.text);
      var crc = crc32(data);

      var local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);  // local file header signature
      local.setUint16(4, 20, true);          // version needed
      local.setUint16(6, 0x0800, true);      // flags: UTF-8 names
      local.setUint16(8, 0, true);           // method: store
      local.setUint16(10, dosTime, true);
      local.setUint16(12, dosDate, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true);
      local.setUint32(22, data.length, true);
      local.setUint16(26, name.length, true);
      local.setUint16(28, 0, true);
      parts.push(local.buffer, name, data);

      var cen = new DataView(new ArrayBuffer(46));
      cen.setUint32(0, 0x02014b50, true);    // central directory signature
      cen.setUint16(4, 20, true);            // version made by
      cen.setUint16(6, 20, true);            // version needed
      cen.setUint16(8, 0x0800, true);
      cen.setUint16(10, 0, true);
      cen.setUint16(12, dosTime, true);
      cen.setUint16(14, dosDate, true);
      cen.setUint32(16, crc, true);
      cen.setUint32(20, data.length, true);
      cen.setUint32(24, data.length, true);
      cen.setUint16(28, name.length, true);
      cen.setUint32(42, offset, true);       // local header offset
      central.push(cen.buffer, name);

      offset += 30 + name.length + data.length;
    });

    var centralSize = central.reduce(function (n, b) { return n + b.byteLength; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);      // end of central directory
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);

    return new Blob(parts.concat(central, [end.buffer]), { type: "application/zip" });
  };
})(window.BYAI = window.BYAI || {});
