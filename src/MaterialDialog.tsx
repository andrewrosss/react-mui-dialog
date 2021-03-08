import {
  Button,
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

type MaterialDialogValue = {
  open: boolean;
  title: string | React.Component;
  contentText: string | React.Component;
  actionButtonText: string | React.Component;
  handleSubmit: (e: React.FormEvent) => Promise<any>;
  closeDialog: () => Promise<void>;
  openDialog?: (x: any) => any;
  dialogProps?: DialogProps;
  dialogTitleProps?: DialogTitleProps;
  dialogContentProps?: DialogContentProps;
  dialogContentTextProps?: DialogContentTextProps;
  dialogActionsProps?: DialogActionsProps;
};

const initialState: MaterialDialogValue = {
  open: false,
  title: "Dialog Title",
  contentText: "Dialog Content Text",
  actionButtonText: "Submit",
  handleSubmit: async (e) => e.preventDefault(),
  closeDialog: () => Promise.resolve(),
};

type ActionOpen = {
  type: "open";
  payload: Omit<MaterialDialogValue, "open">;
};

type ActionClose = {
  type: "close";
  payload?: undefined;
};

type Actions = ActionOpen | ActionClose;

const reducer = (
  state: MaterialDialogValue,
  action: Actions
): MaterialDialogValue => {
  switch (action.type) {
    case "open":
      console.log({ action });
      return { ...action.payload, open: true };
    case "close":
      console.log({ action });
      const { open: _unused, ...rest } = state;
      return { open: false, ...rest };
    default:
      console.log({ action });
      return state;
  }
};

const MaterialDialogContext = createContext<MaterialDialogValue>(initialState);

export const MaterialDialogProvider: React.FC = ({ children }) => {
  const [value, dispatch] = useReducer(reducer, initialState);
  const {
    open,
    title,
    contentText,
    actionButtonText,
    handleSubmit,
    dialogProps,
    dialogTitleProps,
    dialogContentProps,
    dialogActionsProps,
  } = value;

  const openDialog = (
    materialDialogOptions: Partial<Omit<MaterialDialogValue, "open">>
  ) =>
    dispatch({
      type: "open",
      payload: { ...initialState, ...materialDialogOptions },
    });

  const closeDialog = () => dispatch({ type: "close" });

  console.log({ open });

  return (
    <MaterialDialogContext.Provider value={{ ...value, openDialog }}>
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
            <Button onClick={closeDialog} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {actionButtonText}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </MaterialDialogContext.Provider>
  );
};

export const useMaterialDialog = () => useContext(MaterialDialogContext);
