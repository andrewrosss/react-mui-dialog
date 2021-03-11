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
import { Field, FieldAttributes, Form, Formik, FormikHelpers } from "formik";
import React, { useReducer } from "react";
import { createContext, useContext } from "react";

import { TextField } from "formik-material-ui";

type DialogFields = {
  [name: string]: {
    initialValue: any;
    validationSchema?: Yup.AnySchema;
    fieldProps?: FieldAttributes<any>;
    component?: typeof Field;
  };
};

type DialogActionButton =
  | false
  | { children: string | React.ReactNode; props?: ButtonProps }
  | { component: React.ReactNode };

// type DialogOptions<
//   Fields extends DialogFields = DialogFields,
//   Values = Record<keyof Fields, string>
// > = Partial<{
//   title: string | React.ReactNode;
//   contentText: string | React.ReactNode;
//   fields: Fields;
//   cancelButton: DialogActionButton;
//   submitButton: DialogActionButton;
//   onSubmit: (
//     values: Values,
//     formikHelpers: FormikHelpers<Values>
//   ) => Promise<any>;
//   dialogProps: Omit<DialogProps, "open">;
//   subcomponentProps: {
//     dialogTitleProps: DialogTitleProps;
//     dialogContentProps: DialogContentProps;
//     dialogContentTextProps: DialogContentTextProps;
//     dialogActionsProps: DialogActionsProps;
//   };
//   customContent: undefined | React.ReactNode;
// }>;

type OpenDialog = <
  Fields extends DialogFields,
  Values extends Record<keyof Fields, string>
>(
  options: Partial<{
    title: string | React.ReactNode;
    contentText: string | React.ReactNode;
    fields: Fields;
    cancelButton: DialogActionButton;
    submitButton: DialogActionButton;
    onSubmit: (
      values: Values,
      formikHelpers: FormikHelpers<Values>
    ) => Promise<any>;
    dialogProps: Omit<DialogProps, "open">;
    subcomponentProps: Partial<{
      dialogTitleProps: DialogTitleProps;
      dialogContentProps: DialogContentProps;
      dialogContentTextProps: DialogContentTextProps;
      dialogActionsProps: DialogActionsProps;
    }>;
    customContent: undefined | React.ReactNode;
  }>
) => void;

type DialogOptions = Parameters<OpenDialog>[0];

type OpenDialogAction = {
  type: "open";
  payload: DialogOptions;
};
type CloseDialogAction = { type: "close" };
type ResetDialogAction = { type: "reset" };
type Actions = OpenDialogAction | CloseDialogAction | ResetDialogAction;
type State = { open: boolean } & DialogOptions;

const reducer = (state: State, action: Actions): State => {
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

const initialState: State = {
  open: false,
  title: "Dialog Title",
  contentText: "Dialog content text",
  cancelButton: { children: "Cancel" },
  submitButton: { children: "Submit" },
  fields: {},
  onSubmit: () => Promise.resolve(),
  dialogProps: {
    fullWidth: true,
    maxWidth: "sm",
  },
  subcomponentProps: {
    dialogTitleProps: {},
    dialogContentProps: {},
    dialogContentTextProps: {},
    dialogActionsProps: {},
  },
  customContent: undefined,
};

type ContextType = {
  openDialog: OpenDialog;
  closeDialog: () => void;
};

const DialogContext = createContext<ContextType>({
  openDialog: () => null,
  closeDialog: () => null,
});

export const DialogProvider: React.FC = ({ children }) => {
  // The warning [Warning: findDOMNode is deprecated in StrictMode.] is a known issue:
  // https://stackoverflow.com/a/63729408
  const [value, dispatch] = useReducer(reducer, initialState);
  const {
    open,
    onSubmit,
    title,
    contentText,
    fields,
    cancelButton,
    submitButton,
    dialogProps,
    subcomponentProps: sp,
    customContent,
  } = value;

  const initialValues = getInitialValues(fields);
  const validationSchema = getValidationSchema(fields);

  const openDialog: OpenDialog = (options) =>
    dispatch({ type: "open", payload: options as DialogOptions });
  const closeDialog = () => dispatch({ type: "close" });
  const handleExited = () => dispatch({ type: "reset" });
  const handleSubmit = (
    values: typeof initialValues,
    formikHelpers: FormikHelpers<typeof initialValues>
  ) => {
    console.log(!onSubmit);
    if (!onSubmit) return;
    console.log("made it");
    onSubmit(values, formikHelpers).then(closeDialog);
  };

  const dialogContentStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "16px",
  } as const;

  const fieldComponents = Object.entries(
    fields ?? {}
  ).map(([name, fieldOptions]) =>
    React.isValidElement(fieldOptions.component) ? (
      fieldOptions.component
    ) : (
      <Field
        component={TextField}
        variant="outlined"
        fullwidth
        {...fieldOptions.fieldProps}
        name={name}
        key={name}
      />
    )
  );

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <Dialog open={open} onExited={handleExited} {...dialogProps}>
        {customContent ? (
          customContent
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
          >
            {(formProps) => (
              <Form>
                <DialogTitle {...sp?.dialogTitleProps}>{title}</DialogTitle>
                <DialogContent
                  style={dialogContentStyle}
                  {...sp?.dialogContentProps}
                >
                  <DialogContentText {...sp?.dialogContentTextProps}>
                    {contentText}
                  </DialogContentText>
                  {!!fieldComponents.length && fieldComponents}
                </DialogContent>
                <DialogActions {...sp?.dialogActionsProps}>
                  {actionButtonHasComponent(cancelButton) ? (
                    cancelButton.component
                  ) : cancelButton ? (
                    <Button
                      onClick={closeDialog}
                      color="primary"
                      disabled={formProps.isSubmitting}
                      {...cancelButton.props}
                    >
                      {cancelButton.children}
                    </Button>
                  ) : null}
                  {actionButtonHasComponent(submitButton) ? (
                    submitButton.component
                  ) : submitButton ? (
                    <Button
                      type="submit"
                      color="primary"
                      onClick={closeDialog}
                      disabled={formProps.isSubmitting}
                      {...submitButton.props}
                    >
                      {submitButton.children}
                    </Button>
                  ) : null}
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

const getInitialValues = (fields: DialogOptions["fields"]) => {
  return Object.fromEntries(
    Object.entries(fields ?? {}).map(([name, fieldOptions]) => [
      name,
      fieldOptions.initialValue,
    ])
  );
};

const getValidationSchema = (fields: DialogOptions["fields"]) => {
  return Yup.object(
    Object.fromEntries(
      Object.entries(fields ?? {})
        .map(([name, fieldOptions]) => [name, fieldOptions?.validationSchema])
        .filter(([_, v]) => !!v)
    )
  );
};

function actionButtonHasComponent(
  button: any
): button is { component: React.ReactNode } {
  return !!button?.component && React.isValidElement(button.component);
}

// _app.tsx
