import React, { Component } from "react";
import { withRouter } from "react-router";
import app from "../base";

import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';

import snackbar from "../snackbar";
import Snackbar from '@material-ui/core/Snackbar';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing.unit,
    },
    button: {
        margin: theme.spacing.unit,
    },
    leftIcon: {
        marginRight: theme.spacing.unit,
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
    iconSmall: {
        fontSize: 20,
    }
});

class ProfileContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {name : 'Loading',
                      saveNotificationOpen: false,
                      notificationVariant : '',
                      notificationMessage: ''};
    }

    componentWillMount(){
        let usersRef = app.database().ref('users');
        let uid = this.props.uid;
        let that = this;
        usersRef.child(uid).once('value', function(snap) {
            let exists = snap.val() !== null;
            if (exists) {
                let userObj = snap.val();
                that.setState({name: userObj.name});
            }
        });
    }

    handleNameChange = event => {
        this.setState({ name: event.target.value });
    };

    handleSubmit = async event => {
        // TODO - Figure out how to catch errors from firebase and throw an error notification
        event.preventDefault();
        let usersRef = app.database().ref("users");
        usersRef.child(this.props.uid).update({
            name : this.state.name
        });
        this.handleOpenNotification("success", "Successfully updated profile!");
    };

    // notificationVariant: success info warning error
    handleOpenNotification = (notificationVariant, msg) => {
        this.setState({ notificationVariant: notificationVariant,
                        notificationMessage: msg,
                        saveNotificationOpen: true });
    };

    handleNotificationClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ saveNotificationOpen: false });
    };

    render() {
        let MySnackbarContentWrapper = snackbar;
        let classes = this.props.classes;
        return (
            <div className={classes.container}>
                <form onSubmit={this.handleSubmit}>
                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="user_name">Name</InputLabel>
                        <Input
                            id='user_name'
                            value={this.state.name}
                            onChange={this.handleNameChange}
                        />
                    </FormControl>
                    <br/><br/>
                    <Button type="submit" variant="contained" size="small">
                        <SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
                        Save
                    </Button>
                </form>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.saveNotificationOpen}
                    //autoHideDuration={6000}
                    onClose={this.handleNotificationClose}
                >
                    <MySnackbarContentWrapper
                        onClose={this.handleNotificationClose}
                        variant={this.state.notificationVariant}
                        message={this.state.notificationMessage}
                    />
                </Snackbar>
            </div>
        );
    }
}

export default withRouter(withStyles(styles)(ProfileContainer));