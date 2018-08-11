import React, { Component } from "react";
import { withRouter } from "react-router";
import app from "../base";
import firebase from "firebase";

import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';

import snackbar from "../snackbar";
import Snackbar from '@material-ui/core/Snackbar';

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";

import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import CardMedia from '@material-ui/core/CardMedia';

//import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

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
        this.state = {userObj : null,
                      name : '',
                      email : '',
                      jobTitle : '',
                      education: '',
                      work: '',
                      profilePicture: null,
                      profilePictureUrl: "/generic_profile.jpg",
                      theInputKey: '',
                      personalEditMode : false,
                      about : '',
                      aboutEditMode : false,
                      saveNotificationOpen: false,
                      notificationVariant : '',
                      notificationMessage: ''};
    }

    componentWillMount(){
        let that = this;
        this.setUserObj(function(){
            that.loadPersonal();
            that.loadAbout();
        });
        this.setProfileUrl();
    }

    setUserObj(callback){
        let usersRef = app.database().ref('users');
        let uid = this.props.uid;
        let that = this;
        usersRef.child(uid).once('value', function(snap) {
            let exists = snap.val() !== null;
            if (exists) {
                let userObj = snap.val();
                that.setState({userObj: userObj});
                if (callback) {
                    callback();
                }
            }
        });
    }

    getProfilePath(){
        let uid = this.props.uid;
        return 'profilePictures/' + uid
    }

    setProfileUrl(){
        let that = this;
        firebase.storage().ref().child(this.getProfilePath()).getDownloadURL().then(function(url) {
            that.setState({profilePictureUrl: url});
        });
    }

    loadPersonal(){
        let userObj = this.state.userObj;
        this.setState({ name: userObj.name });
        this.setState({ email: userObj.email });
        this.setState({ jobTitle: userObj.jobTitle });
        this.setState({ education: userObj.education });
        this.setState({ work: userObj.work });
        this.setState({ profilePicture: null });
        this.setState({ theInputKey: Math.random().toString(36) });
    }

    loadAbout(){
        this.setState({ about: this.state.userObj.about });
    }

    handlePersonalIconClick = () => {
        this.setState({ personalEditMode: !this.state.personalEditMode });
        // Cancel was clicked
        if (this.state.personalEditMode) {
            this.loadPersonal();
        }
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
        event.preventDefault();
        let usersRef = app.database().ref("users");
        let uid = this.props.uid;
        let userObj = usersRef.child(uid);
        let that = this;
        let success = true;
        userObj.update({
            name : this.state.name,
            jobTitle : this.state.jobTitle,
            education : this.state.education,
            work : this.state.work
        }).catch(function(error) {
            success = false;
            that.handleOpenNotification("error", "Save of personal profile failed: " + error);
        });

        let file = this.state.profilePicture;
        if (file) {
            let metadata = {
                'contentType': file.type
            };
            firebase.storage().ref().child(this.getProfilePath()).put(file, metadata).then(function(snapshot) {
                //console.log('Uploaded', snapshot.totalBytes, 'bytes.');
                //console.log('File metadata:', snapshot.metadata);
                that.setProfileUrl();
            }).catch(function(error) {
                success = false;
                that.handleOpenNotification("error", "Upload of profile picture failed: " + error);
            });
        }

        this.setState({ personalEditMode: false });
        if (success) {
            this.handleOpenNotification("success", "Successfully updated personal profile!");
            this.setUserObj();
        }
    };

    handleAboutChange = event => {
        this.setState({ about: event.target.value });
    };

    handleAboutIconClick = () => {
        this.setState({ aboutEditMode: !this.state.aboutEditMode });
        // Cancel was clicked
        if (this.state.aboutEditMode) {
            this.loadAbout();
        }
    };

    handleAboutSubmit = async event => {
        event.preventDefault();
        let usersRef = app.database().ref("users");
        let that = this;
        let success = true;
        usersRef.child(this.props.uid).update({
            about : this.state.about
        }).catch(function(error) {
            success = false;
            that.handleOpenNotification("error", "Save of about profile failed: " + error);
        });
        this.setState({ aboutEditMode: false });
        if (success) {
            this.handleOpenNotification("success", "Successfully updated about profile!");
            this.setUserObj();
        }
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
        this.setState({ profilePicture: selectorFile });
    };

    render() {
        let MySnackbarContentWrapper = snackbar;
        let classes = this.props.classes;

        let personalSaveClassName = classes.hidden;
        let personalIcon = <i className="material-icons">edit</i>;
        let nameHtml;
        if (this.state.personalEditMode) {
            personalSaveClassName = '';
            personalIcon = <CancelIcon />;
            nameHtml = <TextField
                disabled={!this.state.personalEditMode}
                value={this.state.name}
                onChange={this.handleNameChange}
            />
        }
        else {
            nameHtml = <Typography variant="subheading" gutterBottom>
                {this.state.name}
            </Typography>
        }

        let aboutSaveClassName = classes.hidden;
        let aboutIcon = <i className="material-icons">edit</i>;
        if (this.state.aboutEditMode) {
            aboutSaveClassName = '';
            aboutIcon = <CancelIcon />;
        }

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
                            <Card className={classes.card} raised={this.state.personalEditMode}>
                                <CardHeader
                                    avatar= {
                                        <i className="material-icons">person</i>
                                    }
                                    action={
                                        <IconButton onClick={this.handlePersonalIconClick}>
                                            {personalIcon}
                                        </IconButton>
                                    }
                                    title="Personal"
                                />
                                <input type="file" key={this.state.theInputKey || '' } className={personalSaveClassName} disabled={!this.state.personalEditMode} onChange={this.handleProfilePictureChange} />
                                <CardMedia
                                    className={classes.media}
                                    image={this.state.profilePictureUrl}
                                />
                                <CardContent>
                                    {nameHtml}
                                    <Typography variant="subheading" gutterBottom>
                                        {this.state.email}
                                    </Typography>
                                    <br />
                                    <TextField
                                        label="Job Title"
                                        disabled={!this.state.personalEditMode}
                                        value={this.state.jobTitle}
                                        onChange={this.handleJobTitleChange}
                                    />
                                    <TextField
                                        label="Education"
                                        disabled={!this.state.personalEditMode}
                                        value={this.state.education}
                                        onChange={this.handleEducationChange}
                                    />
                                    <TextField
                                        label="Work"
                                        disabled={!this.state.personalEditMode}
                                        value={this.state.work}
                                        onChange={this.handleWorkChange}
                                    />
                                    <br />
                                    <Button type="submit" variant="contained" size="small" className={personalSaveClassName} disabled={!this.state.personalEditMode}>
                                        <SaveIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
                                        Save
                                    </Button>
                                </CardContent>
                            </Card>
                        </form>
                    </Grid>
                    <Grid item>
                        <form onSubmit={this.handleAboutSubmit} className={classes.padding}>
                            <Card className={classes.card} raised={this.state.aboutEditMode}>
                                <CardHeader
                                    avatar= {
                                        <i className="material-icons">person_outline</i>
                                    }
                                    action={
                                        <IconButton onClick={this.handleAboutIconClick}>
                                            {aboutIcon}
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
                                            disabled={!this.state.aboutEditMode}
                                            value={this.state.about}
                                            onChange={this.handleAboutChange}
                                        />
                                    </FormControl>
                                </CardContent>
                                <Button type="submit" value="save" variant="contained" size="small" className={aboutSaveClassName} disabled={!this.state.aboutEditMode}>
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