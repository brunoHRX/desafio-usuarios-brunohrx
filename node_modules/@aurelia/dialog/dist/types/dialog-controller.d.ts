import { IDialogController, DialogCloseResult } from './dialog-interfaces';
import type { IDialogLoadedSettings } from './dialog-interfaces';
/**
 * A controller object for a Dialog instance.
 */
export declare class DialogController implements IDialogController {
    private readonly p;
    private readonly ctn;
    /**
     * The settings used by this controller.
     */
    settings: IDialogLoadedSettings;
    readonly closed: Promise<DialogCloseResult>;
    /**
     * The dom structure created to support the dialog associated with this controller
     */
    private dom;
    constructor();
    /**
     * Closes the dialog with a successful output.
     *
     * @param value - The returned success output.
     */
    ok(value?: unknown): Promise<DialogCloseResult<'ok'>>;
    /**
     * Closes the dialog with a cancel output.
     *
     * @param value - The returned cancel output.
     */
    cancel(value?: unknown): Promise<DialogCloseResult<'cancel'>>;
    /**
     * Closes the dialog with an error output.
     *
     * @param value - A reason for closing with an error.
     * @returns Promise An empty promise object.
     */
    error(value: unknown): Promise<void>;
    private getOrCreateVm;
    private getDefinition;
}
//# sourceMappingURL=dialog-controller.d.ts.map