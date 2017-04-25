// simple middleware that intercepts events/messages before the active mode/messaged mode
// though of a stack of handlers... but that's complex and for now isn't needed
// see discussion at https://github.com/philc/vimium/issues/2491
// it would probably make the code more intuitive if they were split up

// Current responsibilities:
// 1. Grab back focus if user hasn't interacted with page
// 2. DISCONTINUED: Handle Escape key presses
// 3. DISCONTINUED: Handle Pass keys

let preventStealFocus;
let hasInteractedWithPage = false;

const middleware = {
  onSettingsChange: (settings) => {
    preventStealFocus = settings.preventStealFocus;
    if (!hasInteractedWithPage && preventStealFocus) {
      document.activeElement && document.activeElement.blur();
    }
  },
  events: {
    keydown: (event) => {},
    keypress: (event) => undefined,
    keyup: (event) => undefined,
    blur: (event) => undefined,
    focus: (event) => {
      if (preventStealFocus && (hasInteractedWithPage === false)) {
        event.target.blur();
        return 'Same';
      }
    },
    click: (event) => {},
    mousedown: (event) => {
      hasInteractedWithPage = true;
    }
  },
  messages: {}
};

export function middlewareOnSettingsChange (settings) {
  middleware.onSettingsChange(settings);
}

export async function passDOMEventToMiddleware (event) {
  const nextMode = middleware.events[event.type](event);
  if (SAKA_DEBUG && nextMode) {
    event.middleware = 'generic';
  }
  return nextMode;
}

export async function passMessageToMiddleware (action, arg, src) {
  const messageHandler = middleware.messages[action];
  const nextMode = messageHandler && messageHandler(arg, src);
  if (SAKA_DEBUG && nextMode) {
    event.middleware = 'generic';
  }
  return nextMode;
}
