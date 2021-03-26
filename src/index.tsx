import * as React from "react";
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
  makeStyles,
} from "@material-ui/core";
import {
  Field,
  FieldAttributes,
  Form,
  Formik,
  FormikFormProps,
  FormikHelpers,
  FormikProps,
} from "formik";
import { createContext, useContext } from "react";

import Lazy from "yup/lib/Lazy";
import Reference from "yup/lib/Reference";
import { TextField } from "formik-material-ui";
import startCase from "lodash/startCase";
import { useReducer } from "react";

export type ActionButtonOptions =
  | false
  | { children: string | React.ReactNode; props?: ButtonProps }
  | { component: React.ReactNode };

export type FieldOptions<T extends string = string> = Record<
  T,
  {
    initialValue: any;
    label?: string;
    fieldProps?: FieldAttributes<any>;
    component?: React.ReactNode;
  }
>;

/**
 * Turns ObjectShape into a generic.
 * See: https://github.com/jquense/yup/blob/3b67dc0b59c8cf05fb5ee00b1560a2ab68ca3918/src/object.ts#L30
 */
type YupObjectShape<T extends string> = Record<
  T,
  Yup.AnySchema | Reference | Lazy<any, any>
>;

export type DialogOptions<
  FieldNames extends string = string,
  Fields = FieldOptions<FieldNames>,
  Values = Record<keyof Fields, string>
> = Partial<{
  title: string | React.ReactNode;
  contentText: string | React.ReactNode;
  fields: Fields;
  validationSchema: Yup.ObjectSchema<YupObjectShape<FieldNames>>;
  cancelButton: ActionButtonOptions;
  submitButton: ActionButtonOptions;
  onSubmit: (
    values: Values,
    formikHelpers: FormikHelpers<Values>
  ) => Promise<any>;
  dialogProps: Omit<DialogProps, "open">;
  subcomponentProps: {
    dialogTitleProps?: DialogTitleProps;
    dialogContentProps?: DialogContentProps;
    dialogContentTextProps?: DialogContentTextProps;
    dialogActionsProps?: DialogActionsProps;
    formikProps?: Partial<FormikProps<Values>>;
    formikFormProps?: FormikFormProps;
  };
  customContent: undefined | React.ReactNode;
}>;

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
      return initialState;
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
    formikProps: {},
  },
  customContent: undefined,
};

export type OpenDialog = <T extends string>(options: DialogOptions<T>) => void;

type ContextType = {
  openDialog: OpenDialog;
  closeDialog: () => void;
};

const DialogContext = createContext<ContextType>({
  openDialog: () => null,
  closeDialog: () => null,
});

const useStyles = makeStyles(theme => ({
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: `${theme.spacing(2)}px`,
    marginBottom: theme.spacing(2),
  },
}));

export const DialogProvider: React.FC = ({ children }) => {
  // The warning [Warning: findDOMNode is deprecated in StrictMode.] is a known issue:
  // https://stackoverflow.com/a/63729408
  const classes = useStyles();
  const [value, dispatch] = useReducer(reducer, initialState);
  const {
    open,
    onSubmit,
    title,
    contentText,
    fields,
    validationSchema,
    cancelButton,
    submitButton,
    dialogProps,
    subcomponentProps: sp,
    customContent,
  } = value;

  const initialValues = getInitialValues(fields);

  const openDialog: OpenDialog = options =>
    dispatch({ type: "open", payload: options as DialogOptions });
  const closeDialog = () => dispatch({ type: "close" });
  const handleExited = () => dispatch({ type: "reset" });
  const handleSubmit = (
    values: typeof initialValues,
    formikHelpers: FormikHelpers<typeof initialValues>
  ) => {
    if (!onSubmit) return;
    onSubmit(values, formikHelpers).then(closeDialog);
  };

  const fieldComponents = Object.entries(
    fields ?? {}
  ).map(([name, fieldOptions]) =>
    "component" in fieldOptions ? (
      fieldOptions.component
    ) : (
      <Field
        component={TextField}
        variant="outlined"
        fullWidth
        label={fieldOptions?.label || startCase(name)}
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
            validateOnBlur={false}
            {...sp?.formikProps}
          >
            {formProps => (
              <Form {...sp?.formikFormProps}>
                <DialogTitle {...sp?.dialogTitleProps}>{title}</DialogTitle>

                <DialogContent
                  className={classes.dialogContent}
                  {...sp?.dialogContentProps}
                >
                  {contentText && (
                    <DialogContentText {...sp?.dialogContentTextProps}>
                      {contentText}
                    </DialogContentText>
                  )}
                  {!!fieldComponents.length && fieldComponents}
                </DialogContent>

                <DialogActions {...sp?.dialogActionsProps}>
                  {cancelButton && "component" in cancelButton ? (
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
                  {submitButton && "component" in submitButton ? (
                    submitButton.component
                  ) : submitButton ? (
                    <Button
                      type="submit"
                      color="primary"
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
