/** Light haptic feedback on supported devices */
export function hapticLight() {
  try {
    navigator.vibrate?.(8);
  } catch {
    /* unsupported */
  }
}

export function hapticSuccess() {
  try {
    navigator.vibrate?.([10, 40, 10]);
  } catch {
    /* unsupported */
  }
}

export function hapticWarning() {
  try {
    navigator.vibrate?.([15, 30, 15, 30, 15]);
  } catch {
    /* unsupported */
  }
}
