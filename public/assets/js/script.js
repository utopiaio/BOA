/**
 * this is a "helper" function for PNotify
 *
 */
function iPNotify (option) {
  var pn = new PNotify({
    type: option.type === undefined ? 'success' : option.type,
    text: option.text,
    hide: option.hide === undefined ? true : option.hide,
    animate_speed: 800,
    animation: {
      'effect_in': 'scale',
      'options_in': {
        easing: 'easeOutElastic'
      },
      'effect_out': 'drop',
      'options_out': {
        easing: 'easeOutElastic'
      }
    },
    shadow: false,
    destroy: true,
    icon: false,
    mouse_reset: false
  });

  return pn;
}
