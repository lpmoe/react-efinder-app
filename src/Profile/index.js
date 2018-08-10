import React, { Component } from "react";
import { withRouter } from "react-router";
import app from "../base";
import firebase from "firebase";

import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';

import snackbar from "../snackbar";
import Snackbar from '@material-ui/core/Snackbar';

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";

import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import CardMedia from '@material-ui/core/CardMedia';

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
    },
    card: {
        minWidth: 400,
        maxWidth: 400
    },
    hidden: {
        display: 'none'
    },
    padding: {
        paddingTop: 5,
        paddingBottom: 5
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    }
});

class ProfileContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {name : '',
                      jobTitle : '',
                      education: '',
                      work: '',
                      profilePicture: null,
                      profilePictureUrl: "/generic_profile.jpg",
                      personalEditValue : false,
                      about : '',
                      aboutEditValue : false,
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
                that.setState({jobTitle: userObj.jobTitle});
                that.setState({education: userObj.education});
                that.setState({work: userObj.work});
                that.setState({about: userObj.about});
            }
        });
        firebase.storage().ref().child('profilePictures/' + uid).getDownloadURL().then(function(url) {
            that.setState({profilePictureUrl: url});
        });
    }

    handlePersonalEditClick = () => {
        this.setState(state => ({ personalEditValue: true }));
    };

    handleAboutEditClick = () => {
        this.setState(state => ({ aboutEditValue: true }));
    };

    handleNameChange = event => {
        this.setState({ name: event.target.value });
    };

    handleJobTitleChange = event => {
        this.setState({ jobTitle: event.target.value });
    };

    handleEducationChange = event => {
        this.setState({ education: event.target.value });
    };

    handleWorkChange = event => {
        this.setState({ work: event.target.value });
    };

    handlePersonalSubmit = async event => {
        // TODO - Figure out how to catch errors from firebase and throw an error notification
        event.preventDefault();
        let usersRef = app.database().ref("users");
        let uid = this.props.uid;
        let userObj = usersRef.child(uid);
        userObj.update({
            name : this.state.name,
            jobTitle : this.state.jobTitle,
            education : this.state.education,
            work : this.state.work
        });

        let storageRef = firebase.storage().ref();
        let file = this.state.profilePicture;
        let metadata = {
            'contentType': file.type
        };
        let that = this;
        storageRef.child('profilePictures/' + uid).put(file, metadata).then(function(snapshot) {
            //console.log('Uploaded', snapshot.totalBytes, 'bytes.');
            //console.log('File metadata:', snapshot.metadata);
            snapshot.ref.getDownloadURL().then(function(url) {
                that.setState({profilePictureUrl: url});
            });
        }).catch(function(error) {
            console.error('Upload failed:', error);
        });

        this.setState(state => ({ personalEditValue: false }));
        this.handleOpenNotification("success", "Successfully updated profile!");
    };

    handleAboutChange = event => {
        this.setState({ about: event.target.value });
    };

    handleAboutSubmit = async event => {
        // TODO - Figure out how to catch errors from firebase and throw an error notification
        event.preventDefault();
        let usersRef = app.database().ref("users");
        usersRef.child(this.props.uid).update({
            about : this.state.about
        });
        this.setState(state => ({ aboutEditValue: false }));
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

    handleProfilePictureChange = (event) => {
        let selectorFile = event.target.files[0];
        //console.log(selectorFile);
        this.setState(state => ({ profilePicture: selectorFile }));
    };

    render() {
        let MySnackbarContentWrapper = snackbar;
        let classes = this.props.classes;
        let personalSaveClassName = this.state.personalEditValue ? '' : classes.hidden;
        let aboutSaveClassName = this.state.aboutEditValue ? '' : classes.hidden;
        return (
            <div className={classes.container}>
                <Grid
                    container
                    direction="column"
                    justify="center"
                    //alignItems="center"
                    alignItems="flex-start"
                >
                    <Grid item>
                        <form onSubmit={this.handlePersonalSubmit} className={classes.padding}>
                            <Card className={classes.card} raised={this.state.personalEditValue}>
                                <CardHeader
                                    avatar= {
                                        <Button type="submit" variant="contained" size="small" className={personalSaveClassName} disabled={!this.state.personalEditValue}>
                                            <SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
                                            Save
                                        </Button>
                                    }
                                    action={
                                        <IconButton onClick={this.handlePersonalEditClick}>
                                            <i className="material-icons">edit</i>
                                        </IconButton>
                                    }
                                />
                                <CardMedia
                                    className={classes.media}
                                    image={this.state.profilePictureUrl}
                                />
                                <CardContent>
                                    <input type="file" className={personalSaveClassName} disabled={!this.state.personalEditValue} onChange={this.handleProfilePictureChange} />
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="user_name">Name</InputLabel>
                                        <Input
                                            id='user_name'
                                            disabled={!this.state.personalEditValue}
                                            value={this.state.name}
                                            onChange={this.handleNameChange}
                                        />
                                    </FormControl>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="job_title">Job Title</InputLabel>
                                        <Input
                                            id='job_title'
                                            disabled={!this.state.personalEditValue}
                                            value={this.state.jobTitle}
                                            onChange={this.handleJobTitleChange}
                                        />
                                    </FormControl>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="education">Education</InputLabel>
                                        <Input
                                            id='education'
                                            disabled={!this.state.personalEditValue}
                                            value={this.state.education}
                                            onChange={this.handleEducationChange}
                                        />
                                    </FormControl>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="education">Work</InputLabel>
                                        <Input
                                            id='work'
                                            disabled={!this.state.personalEditValue}
                                            value={this.state.work}
                                            onChange={this.handleWorkChange}
                                        />
                                    </FormControl>
                                </CardContent>
                            </Card>
                        </form>
                    </Grid>
                    <Grid item>
                        <form onSubmit={this.handleAboutSubmit} className={classes.padding}>
                            <Card className={classes.card} raised={this.state.aboutEditValue}>
                                <CardHeader
                                    avatar= {
                                        <i className="material-icons">person</i>
                                    }
                                    action={
                                        <IconButton onClick={this.handleAboutEditClick}>
                                            <i className="material-icons">edit</i>
                                        </IconButton>
                                    }
                                    title="About"
                                />
                                <CardContent>
                                    <FormControl className={classes.formControl}>
                                        <TextField
                                            //label="About"
                                            multiline
                                            rows="6"
                                            margin="normal"
                                            disabled={!this.state.aboutEditValue}
                                            value={this.state.about}
                                            onChange={this.handleAboutChange}
                                        />
                                    </FormControl>
                                </CardContent>
                                <Button type="submit" variant="contained" size="small" className={aboutSaveClassName} disabled={!this.state.aboutEditValue}>
                                    <SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
                                    Save
                                </Button>
                            </Card>
                        </form>
                    </Grid>
                </Grid>
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