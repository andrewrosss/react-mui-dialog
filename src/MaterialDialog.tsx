import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogActionsProps,
  DialogContent,
  DialogContentProps,
  DialogContentText,
  DialogContentTextProps,
  DialogProps,
  DialogTitle,
  DialogTitleProps,
  TextField,
} from "@material-ui/core";
import React, { useReducer } from "react";
import { createContext, useContext } from "react";

/**
 * Target semantics:
 * openDialog(dialogOptions).then(handleUserResponse)
 *
 * Acceptable semantics:
 * openDialog({onSubmit: handleSubmit, ...dialogOptions})
 *
 */

type DialogOptions = Partial<{
  // handlers
  onSubmit: (e: React.FormEvent) => Promise<any>;
  // Dialog content
  title: string | React.Component;
  contentText: string | React.Component;
  cancelButtonText: string | React.Component;
  actionButtonText: string | React.Component;
  // subcomponent props
  dialogProps: Omit<DialogProps, "open">;
  dialogTitleProps: DialogTitleProps;
  dialogContentProps: DialogContentProps;
  dialogContentTextProps: DialogContentTextProps;
  dialogActionsProps: DialogActionsProps;
  cancelButtonProps: ButtonProps;
  actionButtonProps: ButtonProps;
}>;

type DialogState = { open: boolean } & DialogOptions;

type OpenDialogAction = {
  type: "open";
  payload: DialogOptions;
};

type CloseDialogAction = {
  type: "close";
  payload?: undefined;
};
type Actions = OpenDialogAction | CloseDialogAction;

const reducer = (state: DialogState, action: Actions): DialogState => {
  switch (action.type) {
    case "open":
      console.log({ state, "action.payload": action.payload });
      return { ...state, ...action.payload, open: true };
    case "close":
      return { ...state, open: false };
    default:
      return state;
  }
};

const initialState: DialogState = {
  open: false,
  title: "Dialog Title",
  contentText: "Dialog Content Text",
  cancelButtonText: "Cancel",
  actionButtonText: "Submit",
  onSubmit: async (e: React.FormEvent) => e.preventDefault(),
  dialogProps: {
    fullWidth: true,
    maxWidth: "sm",
  },
};

type ContextType = {
  openDialog: (options: DialogOptions) => any;
};

const DialogContext = createContext<ContextType>({ openDialog: () => null });

export const DialogProvider: React.FC = ({ children }) => {
  const [value, dispatch] = useReducer(reducer, initialState);
  const {
    open,
    onSubmit,
    title,
    contentText,
    cancelButtonText,
    actionButtonText,
    dialogProps,
    dialogTitleProps,
    dialogContentProps,
    dialogActionsProps,
    cancelButtonProps,
    actionButtonProps,
  } = value;

  const openDialog = (options: DialogOptions) =>
    dispatch({ type: "open", payload: options });
  const closeDialog = () => dispatch({ type: "close" });
  const handleSubmit = (e: React.FormEvent) => {
    if (!onSubmit) return e.preventDefault();
    onSubmit(e).then(closeDialog);
  };

  return (
    <DialogContext.Provider value={{ openDialog }}>
      {children}
      <Dialog open={open} {...dialogProps} aria-labelledby="form-dialog-title">
        <DialogTitle {...dialogTitleProps}>{title}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent {...dialogContentProps}>
            <DialogContentText>{contentText}</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Email Address"
              type="email"
              fullWidth
            />
          </DialogContent>
          <DialogActions {...dialogActionsProps}>
            <Button
              onClick={closeDialog}
              color="primary"
              {...cancelButtonProps}
            >
              {cancelButtonText}
            </Button>
            <Button type="submit" color="primary" {...actionButtonProps}>
              {actionButtonText}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </DialogContext.Provider>
  );
};

export const useDialog = () => useContext(DialogContext);
