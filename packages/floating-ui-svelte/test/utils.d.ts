declare function sleep(ms?: number): Promise<unknown>;
/**
 * A wrapper around the internal kbd object to make it easier to use in tests
 * which require the key names to be wrapped in curly braces.
 */
declare const testKbd: {
    SHIFT_TAB: string;
    k: string;
    a: string;
    p: string;
    F1: string;
    F10: string;
    F11: string;
    F12: string;
    F2: string;
    F3: string;
    F4: string;
    F5: string;
    F6: string;
    F7: string;
    F8: string;
    F9: string;
    P: string;
    A: string;
    n: string;
    j: string;
    ALT: string;
    ARROW_DOWN: string;
    ARROW_LEFT: string;
    ARROW_RIGHT: string;
    ARROW_UP: string;
    BACKSPACE: string;
    CAPS_LOCK: string;
    CONTROL: string;
    DELETE: string;
    END: string;
    ENTER: string;
    ESCAPE: string;
    HOME: string;
    META: string;
    PAGE_DOWN: string;
    PAGE_UP: string;
    SHIFT: string;
    SPACE: string;
    TAB: string;
    CTRL: string;
    ASTERISK: string;
};
export { testKbd, sleep };
