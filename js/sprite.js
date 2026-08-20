/* Sprite sheets.

   Images live nine to a sheet, in reading order (left to right, top to
   bottom). An image's permanent number is all that's needed to find it:

     image 3   -> images/1.jpg, row 0, col 2
     image 137 -> images/16.jpg, row 0, col 1

   So a sentence carries img:3 and nothing else. Layout comes from
   GH_BANK.sheets, so a different grid only means editing that block. */

window.GH = window.GH || {};

GH.sprite = (function(){

  function cfg(){
    return (window.GH_BANK && GH_BANK.sheets) || {
      prefix:'images/', ext:'.jpg', cols:3, rows:3, pad:1, aspect:'2 / 3'
    };
  }

  function pad(n, width){
    var s = String(n);
    while (s.length < width) s = '0' + s;
    return s;
  }

  /* number -> { url, x, y, sizeX, sizeY, aspect, sheet, row, col } */
  function locate(n){
    var c = cfg();
    var per = c.cols * c.rows;
    var i = Math.max(1, Math.floor(n)) - 1;
    var sheet = Math.floor(i / per) + 1;
    var slot = i % per;
    var row = Math.floor(slot / c.cols);
    var col = slot % c.cols;
    return {
      url:c.prefix + pad(sheet, c.pad || 2) + c.ext,
      x:c.cols > 1 ? (col * 100) / (c.cols - 1) : 0,
      y:c.rows > 1 ? (row * 100) / (c.rows - 1) : 0,
      sizeX:c.cols * 100,
      sizeY:c.rows * 100,
      aspect:c.aspect,
      sheet:sheet,
      row:row,
      col:col
    };
  }

  /* Builds the element that shows one tile. */
  function tile(n){
    var s = locate(n);
    var box = document.createElement('div');
    box.className = 'sprite';
    box.style.backgroundImage = 'url("' + s.url + '")';
    box.style.backgroundSize = s.sizeX + '% ' + s.sizeY + '%';
    box.style.backgroundPosition = s.x + '% ' + s.y + '%';
    box.style.aspectRatio = s.aspect;
    return box;
  }

  return { locate:locate, tile:tile };
})();
