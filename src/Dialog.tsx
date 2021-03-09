import * as Yup from "yup";

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
} from "@material-ui/core";
import { Field, Form, Formik, FormikHelpers } from "formik";
import React, { useReducer } from "react";
import { createContext, useContext } from "react";

import { TextField } from "formik-material-ui";

type OpenDialog = <
  Values extends { [K: string]: string },
  Labels extends Record<keyof Values, string>,
  ValidationSchema extends Yup.ObjectSchema<Record<keyof Values, Yup.AnySchema>>
>(
  options: Partial<{
    // form configuration
    initialValues: Values;
    labels: Labels;
    validationSchema: undefined | ValidationSchema;
    // handlers
    onSubmit: (
      values: Values,
      formikHelpers: FormikHelpers<Values>
    ) => Promise<any>;
    // Dialog content
    title: string | React.ReactNode;
    content: string | React.ReactNode;
    cancelButton: string | React.ReactNode;
    actionButton: string | React.ReactNode;
    // subcomponent props
    dialogProps: Omit<DialogProps, "open">;
    dialogTitleProps: DialogTitleProps;
    dialogContentProps: DialogContentProps;
    dialogContentTextProps: DialogContentTextProps;
    dialogActionsProps: DialogActionsProps;
    cancelButtonProps: ButtonProps;
    actionButtonProps: ButtonProps;
    // enable user to pass a totally custom form
    customForm: undefined | React.ReactNode;
  }>
) => void;

type CloseDialog = () => any;

type DialogOptions = Parameters<OpenDialog>[0];

type DialogState = { open: boolean } & DialogOptions;

type OpenDialogAction = {
  type: "open";
  payload: DialogOptions;
};

type CloseDialogAction = {
  type: "close";
  payload?: undefined;
};

type ResetDialogAction = {
  type: "reset";
  payload?: undefined;
};

type Actions = OpenDialogAction | CloseDialogAction | ResetDialogAction;

const reducer = (state: DialogState, action: Actions): DialogState => {
  switch (action.type) {
    case "open":
      return { ...state, ...action.payload, open: true };
    case "close":
      return { ...state, open: false };
    case "reset":
      return { ...state, ...initialState };
    default:
      return state;
  }
};

const initialState: DialogState = {
  open: false,
  title: "Dialog Title",
  content: "Dialog Content Text",
  cancelButton: "Cancel",
  actionButton: "Submit",
  initialValues: {},
  labels: {},
  validationSchema: undefined,
  onSubmit: (a, b) => Promise.resolve(),
  dialogProps: {
    fullWidth: true,
    maxWidth: "sm",
  },
  dialogTitleProps: {},
  dialogContentProps: {},
  dialogContentTextProps: {},
  dialogActionsProps: {},
  cancelButtonProps: {},
  actionButtonProps: {},
  customForm: undefined,
};

type ContextType = {
  openDialog: OpenDialog;
  closeDialog: CloseDialog;
};

const DialogContext = createContext<ContextType>({
  openDialog: () => null,
  closeDialog: () => null,
});

export const DialogProvider: React.FC = ({ children }) => {
  const [value, dispatch] = useReducer(reducer, initialState);
  const {
    open,
    onSubmit,
    initialValues = {},
    labels,
    validationSchema,
    title,
    content,
    cancelButton,
    actionButton,
    dialogProps,
    dialogTitleProps,
    dialogContentProps,
    dialogContentTextProps,
    dialogActionsProps,
    cancelButtonProps,
    actionButtonProps,
    customForm,
  } = value;

  const openDialog: OpenDialog = (options) =>
    dispatch({ type: "open", payload: options as DialogOptions });
  const closeDialog = () => dispatch({ type: "close" });
  const handleExited = () => dispatch({ type: "reset" });
  const handleSubmit = (
    values: typeof initialValues,
    formikHelpers: FormikHelpers<typeof initialValues>
  ) => {
    console.log("made it");
    if (!onSubmit) return;
    onSubmit(values, formikHelpers).then(closeDialog);
  };

  const dialogContentStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "16px",
  } as const;

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <Dialog open={open} onExited={handleExited} {...dialogProps}>
        {customForm ? (
          customForm
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
          >
            {(formProps) => (
              <Form>
                <DialogTitle {...dialogTitleProps}>{title}</DialogTitle>
                <DialogContent
                  style={dialogContentStyle}
                  {...dialogContentProps}
                >
                  <DialogContentText {...dialogContentTextProps}>
                    {content}
                  </DialogContentText>
                  {!!Object.keys(initialValues ?? {}).length &&
                    Object.keys(initialValues).map((k) => (
                      <Field
                        component={TextField}
                        label={labels?.[k]}
                        name={k}
                        variant="outlined"
                        fullwidth
                        type={k === "password" ? "password" : "text"}
                      />
                    ))}
                </DialogContent>
                <DialogActions {...dialogActionsProps}>
                  <Button
                    onClick={closeDialog}
                    color="primary"
                    disabled={formProps.isSubmitting}
                    {...cancelButtonProps}
                  >
                    {cancelButton}
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={formProps.isSubmitting || !formProps.isValid}
                    {...actionButtonProps}
                  >
                    {actionButton}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        )}
      </Dialog>
    </DialogContext.Provider>
  );
};

export const useDialog = () => useContext(DialogContext);

// _app.tsx
