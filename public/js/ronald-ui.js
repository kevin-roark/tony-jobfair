
module.exports.flash = function(text, timeout) {
  if (!text) return;
  if (!timeout) timeout = 275;

  $('#flash').text(text);
  $('#flash').show();
  setTimeout(function() {
    $('#flash').hide();
  }, timeout);
};

module.exports.fadeOverlay = function(fadein, callback, color, time) {
  if (!color) color = 'rgb(255, 255, 255)';
  if (!time) time = 4000;
  if (!callback) callback = function(){};

  if (fadein) {
    $('.overlay').css('background-color', color);
    $('.overlay').fadeIn(time, function() {
      callback();
    });
  } else {
    $('.overlay').fadeOut(time, function() {
      callback();
    });
  }
};
