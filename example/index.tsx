import "react-app-polyfill/ie11";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Yup from "yup";

import {
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  CssBaseline,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
  makeStyles,
  withStyles,
} from "@material-ui/core";
import { CheckboxWithLabel, Select } from "formik-material-ui";
import { DialogProvider, useDialog } from "../.";

import { Field } from "formik";

const useStyles = makeStyles(theme => ({
  card: {
    marginTop: theme.spacing(8),
  },
  box: {
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    gap: theme.spacing(2),
  },
  heading: {
    marginBottom: theme.spacing(1),
  },
  divider: {
    width: "100%",
  },
  buttonContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
}));

/**
 *
 * ULTRA-BASIC DIALOG - essentially just a glorified button.
 *
 */
const NotificationButton = () => {
  const classes = useStyles();
  const { openDialog } = useDialog();

  const handleClick = () =>
    openDialog({
      // set the dialog's title
      title: "There's change in the Air!",
      // include some text to show the user, NOTE: this could be any arbitrary
      // component, not just a string.
      contentText: "Here's what's new in version 2.0 ...",
      // don't render the cancel button, because in this case the only thing a
      // user can do is "dismiss" the notification.
      cancelButton: false,
      // Mui defaults to text buttons, let's use a contained one styled with
      // the theme's primary color
      submitButton: {
        children: "Dismiss",
        props: {
          variant: "contained",
          color: "primary",
        },
      },
      // onSubmit must return a promise, and since no fields have been defined,
      // all we need to know is _that_ the user clicked the submit (dismiss)
      // button.
      onSubmit: async () => alert("The user dismissed this notification."),
    });

  return (
    <div className={classes.buttonContainer}>
      <Typography color="textSecondary">Basic Dialog</Typography>
      <Button variant="contained" color="primary" onClick={handleClick}>
        Show Notification
      </Button>
    </div>
  );
};

// helper components

const CapitalizedButton = withStyles(theme => ({
  label: { textTransform: "capitalize" },
}))(Button);

const RedCapitalizedButton = withStyles(theme => ({
  root: {
    color: theme.palette.error.dark,
    backgroundColor: "rgba(0, 0, 0, 0)",
    border: `1px solid ${theme.palette.error.dark}`,
    "&:hover": {
      color: theme.palette.getContrastText(theme.palette.error.dark),
      backgroundColor: theme.palette.error.dark,
      border: `1px solid ${theme.palette.error.dark}`,
    },
  },
  label: { textTransform: "none" },
}))(Button);

/**
 *
 * BASIC DIALOG - some basic customization
 *
 */
const DeleteButton = () => {
  const classes = useStyles();
  const { closeDialog, openDialog } = useDialog();

  const docId = "abcd1234";
  const docName = "My Old Document";

  const handleClick = () =>
    openDialog({
      title: "Delete this document?",
      // a component this time
      contentText: (
        <Typography color="textSecondary">
          You are about to delete the document <b>{docName}</b>. This cannot be
          undone.
        </Typography>
      ),
      // In this case we'll pass our own button components. Because we're
      // passing our own component we have to handle closing the dialog
      // when we click cancel
      cancelButton: {
        component: (
          <CapitalizedButton onClick={closeDialog}>Cancel</CapitalizedButton>
        ),
      },
      // NOTE: make sure to set type='submit' for the submit button
      submitButton: {
        component: (
          <RedCapitalizedButton type="submit" variant="contained">
            Yes I'm sure, delete this document
          </RedCapitalizedButton>
        ),
      },
      onSubmit: async () =>
        alert(`Deleting document name [${docName}] with ID [${docId}]`),
    });

  return (
    <div className={classes.buttonContainer}>
      <Typography color="textSecondary">Dialog with custom buttons</Typography>
      <RedCapitalizedButton variant="contained" onClick={handleClick}>
        Delete
      </RedCapitalizedButton>
    </div>
  );
};

/**
 *
 * LESS-BASIC DIALOG - render a text field with some simple validation
 *
 */
const SubscribeButton = () => {
  const classes = useStyles();
  const { openDialog } = useDialog();

  const handleClick = () =>
    openDialog({
      title: "Subscribe",
      contentText:
        "To subscribe to this website, please enter your email address here. We will send updates occasionally.",
      // Render formik fields in the dialog by specifying fields (below), each
      // key is used as the name of a field in the formik form. There is
      // a 1:1 mapping between the keys below and fields in the form.
      fields: {
        emailAddress: {
          // these parameters are sent to this particular formik <Field /> component
          initialValue: "",
          validationSchema: Yup.string()
            .required("This field is required")
            .email("Must be a valid email"),
          fieldProps: { label: "Email Address", variant: "filled" },
        },
      },
      cancelButton: { children: "No Thanks" },
      submitButton: { children: "Subscribe" },
      onSubmit: async ({ emailAddress }) =>
        alert(`Added email [${emailAddress}] to the mailing list!`),
    });

  return (
    <div className={classes.buttonContainer}>
      <Typography color="textSecondary">Dialog with fields</Typography>
      <Button variant="outlined" onClick={handleClick}>
        Subscribe
      </Button>
    </div>
  );
};

/**
 *
 * MEDIUM DIALOG - multiple custom fields
 *
 */
const SettingsButton = () => {
  const classes = useStyles();
  const { openDialog } = useDialog();

  const defaultSettings = {
    username: "myUsername",
    onMailingList: true,
    notificationRetention: "2_weeks",
  };

  const handleClick = () =>
    openDialog({
      title: "Profile Settings",
      contentText: null,
      // Render formik fields in the dialog by specifying fields (below), each
      // key is used as the name of a field in the formik form. There is
      // a 1:1 mapping between the keys below and fields in the form.
      fields: {
        username: {
          // these parameters are sent to this particular formik <Field /> component
          initialValue: defaultSettings.username,
          validationSchema: Yup.string().required("username cannot be empty"),
          fieldProps: { label: "Username" },
        },
        // here we render something other than a text field by modifying
        // the props that are passed to the formik <Field /> component.
        onMailingList: {
          initialValue: defaultSettings.onMailingList,
          fieldProps: {
            component: CheckboxWithLabel,
            type: "checkbox",
            Label: { label: "Receive newsletter" },
          },
        },
        // Here we pass our own component, if [fieldName].component is
        // specified then this component will be rendered and
        // [fieldName].fieldProps will be ignored.
        notificationRetention: {
          initialValue: defaultSettings.notificationRetention,
          component: (
            <FormControl>
              <InputLabel htmlFor="notificationRetention">
                Keep notifications for
              </InputLabel>
              <Field
                component={Select}
                name="notificationRetention"
                inputProps={{
                  id: "notificationRetention",
                }}
              >
                <MenuItem value={"1_week"}>1 Week</MenuItem>
                <MenuItem value={"2_weeks"}>2 Weeks</MenuItem>
                <MenuItem value={"1_month"}>1 Month</MenuItem>
              </Field>
            </FormControl>
          ),
        },
      },
      cancelButton: { children: "Close" },
      submitButton: {
        children: "Save",
        props: { variant: "contained", color: "secondary" },
      },
      onSubmit: async ({ username, onMailingList, notificationRetention }) =>
        alert(
          `Saving settings Username [${username}], Receive newsletter [${onMailingList}], Keep notifications for [${notificationRetention}]`
        ),
    });

  return (
    <div className={classes.buttonContainer}>
      <Typography color="textSecondary">Dialog with custom fields</Typography>
      <Button variant="outlined" onClick={handleClick}>
        Settings
      </Button>
    </div>
  );
};

const CustomForm: React.FC<{ onCancel: any }> = ({ onCancel }) => {
  const [state, setState] = React.useState({
    email: "email@domain.com",
    terms: false,
    mailing: true,
  });
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };
  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [e.target.name]: e.target.checked });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Email [${state.email}] with answers to terms [${state.terms}] and mailing [${state.mailing}]`
    );
    onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: "16px",
        padding: "16px",
      }}
    >
      <Typography variant="h6">Terms & Privacy</Typography>
      <Typography color="textSecondary">We've updated our terms ...</Typography>
      <TextField
        type="email"
        name="email"
        label={"Updated Email"}
        variant="filled"
        fullWidth
        required
        value={state.email}
        onChange={handleTextChange}
      />
      <div style={{ display: "flex", alignItems: "center" }}>
        <FormControlLabel
          control={
            <Checkbox
              name="terms"
              checked={state.terms}
              required
              onChange={handleCheckChange}
            />
          }
          label="Accept Terms"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="mailing"
              checked={state.mailing}
              onChange={handleCheckChange}
            />
          }
          label="Reveive newsletter"
        />
      </div>
      <div style={{ alignSelf: "end", display: "flex", gap: "16px" }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" type="submit">
          Udpate
        </Button>
      </div>
    </form>
  );
};

/**
 *
 * FULLY CUSTOM DIALOG - entire contents fo the dialog are user-provided. (BYOC - Bring your own components)
 *
 */
const ViewTermsButton = () => {
  const classes = useStyles();
  const { openDialog, closeDialog } = useDialog();

  const handleClick = () => {
    openDialog({
      customContent: <CustomForm onCancel={closeDialog} />,
    });
  };

  return (
    <div className={classes.buttonContainer}>
      <Typography color="textSecondary">
        Dialog with completely custom contents
      </Typography>
      <Button variant="outlined" color="primary" onClick={handleClick}>
        View Terms
      </Button>
    </div>
  );
};

/**
 *
 * DEMO PAGE SETUP - centering, padding, group everything in a card ...
 *
 */
const App = () => {
  const classes = useStyles();

  return (
    <DialogProvider>
      <CssBaseline />
      <Container maxWidth="sm">
        <Card className={classes.card}>
          <Box p={4} className={classes.box}>
            <Typography variant="h5" className={classes.heading}>
              Sample Configurations
            </Typography>
            <NotificationButton />
            <Divider className={classes.divider} />
            <DeleteButton />
            <Divider className={classes.divider} />
            <SubscribeButton />
            <Divider className={classes.divider} />
            <SettingsButton />
            <Divider className={classes.divider} />
            <ViewTermsButton />
          </Box>
        </Card>
      </Container>
    </DialogProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
