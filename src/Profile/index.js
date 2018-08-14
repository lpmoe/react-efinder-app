// TODO - Change to tab indent on 2 spaces
import React, { Component } from "react";
import { withRouter } from "react-router";
// TODO - Should make a util/userUtil.js to house common user functions
// (similar to what was done with skillUtil.js)
import app from "../base";
import firebase from "firebase";

import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
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
import Button from '@material-ui/core/Button';

import CustomReactSelect from '../customReactSelect'
import Chip from "@material-ui/core/Chip";

import SkillUtil from '../util/skillUtil'

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    button: {
        margin: theme.spacing.unit,
    },
    leftIcon: {
        marginRight: theme.spacing.unit,
    },
    iconSmall: {
        fontSize: 20,
    },
    card: {
        minWidth: 450,
        //maxWidth: 450
        //minHeight: 500
    },
    cardheader: {
      //paddingBottom: 5
    },
    aboutTextField: {
        width: 400
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
    },
    chip: {
      margin: theme.spacing.unit / 2,
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
                      facebook_url: '',
                      twitter_url: '',
                      linkedin_url: '',
                      profilePicture: '',
                      profilePictureUrl: "/generic_profile.jpg",
                      theInputKey: '',
                      personalEditMode : false,
                      about : '',
                      aboutEditMode : false,
                      skillEditMode : false,
                      saveNotificationOpen: false,
                      notificationVariant : '',
                      notificationMessage: '',
                      skillSuggestions : [],
                      skills : [],
                      untrackedSkills : [],
                      skillsMulti : null};

        this.handleCustomSelectChange = this.handleCustomSelectChange.bind(this);
    }

    componentWillMount(){
        let that = this;
        this.setUserObj(function(){
            that.loadPersonal();
            that.loadAbout();
            that.loadSkill();
        });
        this.setSkillSuggestions();
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

    setSkillSuggestions(){
      SkillUtil.setTrackedSkills(this, 'skillSuggestions', true);
    }

    setStateKeyToVal(key, value){
        // If null, state doesn't get updated. For example, if state was 'hi' and attempted to set state to null/undefined,
        // the value will remain as 'hi'
        if (value) {
            this.setState({ [key]: value });
        }
        else {
            this.setState({ [key]: '' });
        }
    }

    loadPersonal(){
        let userObj = this.state.userObj;
        let myStringArray = ['name', 'email', 'jobTitle', 'education', 'work', 'profilePicture', 'facebook_url', 'linkedin_url', 'twitter_url'];
        let arrayLength = myStringArray.length;
        for (let i = 0; i < arrayLength; i++) {
            let key = myStringArray[i];
            this.setStateKeyToVal(key, userObj[key]);
        }

        this.setState({ profilePicture: '' });
        this.setState({ theInputKey: Math.random().toString(36) });
    }

    loadAbout(){
        let userObj = this.state.userObj;
        let myStringArray = ['about'];
        let arrayLength = myStringArray.length;
        for (let i = 0; i < arrayLength; i++) {
            let key = myStringArray[i];
            this.setStateKeyToVal(key, userObj[key]);
        }
    }

    loadSkill(){
        let userObj = this.state.userObj;
        // Need to set it from userObj and not just set skills state because setState is atomic
        let skillArr = userObj.skills;
        this.setState({skills : skillArr});
        if (!skillArr) {
          skillArr = [];
        }
        SkillUtil.setSkillsMulti(this, 'skillsMulti', skillArr);
    }

    handlePersonalIconClick = () => {
        this.setState({ personalEditMode: !this.state.personalEditMode });
        // Cancel was clicked
        if (this.state.personalEditMode) {
            this.loadPersonal();
        }
    };

    handleSocialMediaClick = event => {
        let src = event.target.src;
        if (src.includes("facebook")) {
            if (this.state.facebook_url) {
                window.location = this.state.facebook_url;
            }
        }
        else if (src.includes("linkedin")) {
            if (this.state.linkedin_url) {
                window.location = this.state.linkedin_url;
            }
        }
        else if (src.includes("twitter")) {
            if (this.state.twitter_url) {
                window.location = this.state.twitter_url;
            }
        }
    };

    handleChange(key, evt) {
        this.setState({ [key]: evt.target.value });
    }

    handlePersonalSubmit = async event => {
        event.preventDefault();
        let that = this;
        try {
            let usersRef = app.database().ref("users");
            let uid = this.props.uid;
            let userObj = usersRef.child(uid);
            // Note: This will save to the database empty string. Not sure if that matters
            userObj.update({
                name : this.state.name,
                jobTitle : this.state.jobTitle,
                education : this.state.education,
                work : this.state.work,
                facebook_url : this.state.facebook_url,
                linkedin_url : this.state.linkedin_url,
                twitter_url : this.state.twitter_url
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
                })
            }

            this.setUserObj();
            this.setState({ personalEditMode: false });
            this.handleOpenNotification("success", "Successfully updated personal profile!");
        }
        catch(error) {
            this.handleOpenNotification("error", "Save of personal profile failed: " + error);
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
        try{
            let usersRef = app.database().ref("users");
            usersRef.child(this.props.uid).update({
                about : this.state.about
            });
            this.setUserObj();
            this.setState({ aboutEditMode: false });
            this.handleOpenNotification("success", "Successfully updated about profile!");
        }
        catch(error) {
            this.handleOpenNotification("error", "Save of about profile failed: " + error);
        }
    };

    handleSkillIconClick = () => {
        this.setState({ skillEditMode: !this.state.skillEditMode });
        // Cancel was clicked
        if (this.state.skillEditMode) {
            this.loadSkill();
        }
    };

  handleSkillSubmit = async event => {
    event.preventDefault();
    try{
      let usersRef = app.database().ref("users");
      usersRef.child(this.props.uid).update({
          skills : this.state.skills
      });

      // Add any untrackedSkills to db
      if (this.state.untrackedSkills.length > 0) {
        SkillUtil.addUntrackedSkills(this.state.untrackedSkills);
      }

      this.setUserObj();
      this.setState({ skillEditMode: false });
      this.handleOpenNotification("success", "Successfully updated skills profile!");
    }
    catch(error) {
        this.handleOpenNotification("error", "Save of skills profile failed: " + error);
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

    handleCustomSelectChange(key, value) {
        let skillsArr = [];
        let untrackedSkillsArr = [];
        for (let i = 0; i < value.length; i++) {
            skillsArr.push(value[i].label);
            if (value[i].__isNew__) {
                untrackedSkillsArr.push(value[i].label);
            }
        }
        this.setState({ [key]: value,
                        skills: skillsArr,
                        untrackedSkills : untrackedSkillsArr });
    }

    render() {
        let MySnackbarContentWrapper = snackbar;
        let classes = this.props.classes;

        let personalSaveHidden = classes.hidden;
        let personalSaveHiddenOnEdit = '';
        let personalIcon = <i className="material-icons">edit</i>;
        let nameHtml;
        if (this.state.personalEditMode) {
            personalSaveHidden = '';
            personalSaveHiddenOnEdit = classes.hidden;
            personalIcon = <CancelIcon />;
            nameHtml = <TextField
                disabled={!this.state.personalEditMode}
                value={this.state.name}
                onChange={(e) => this.handleChange('name', e)}
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

        let skillSaveClassName = classes.hidden;
        let skillIcon = <i className="material-icons">edit</i>;
        // Would've preferred to just be able to disableUnderline to accomplish this, but couldn't get that working
        let skillsToLoop = this.state.skills ? this.state.skills : [];
        let skillHtml = skillsToLoop.map(data => {return <Chip key={data} label={data} className={classes.chip} />;});
        if (this.state.skillEditMode) {
            skillSaveClassName = '';
            skillIcon = <CancelIcon />;
            skillHtml = <CustomReactSelect
                          id='skillsMulti'
                          onChange={this.handleCustomSelectChange}
                          value={this.state.skillsMulti}
                          placeholder="Select or type skills to add"
                          isDisabled={!this.state.skillEditMode}
                          suggestions={this.state.skillSuggestions}
                        />
        }

        return (
            <div className={classes.container}>
                <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center">
                    <Grid item>
                        <form onSubmit={this.handlePersonalSubmit} className={classes.padding}>
                            <Card className={classes.card} raised={this.state.personalEditMode}>
                                <CardHeader className={classes.cardheader}
                                    avatar= {
                                        <i className="material-icons">person</i>
                                    }
                                    action={
                                        <div>
                                            <IconButton type="submit" className={personalSaveHidden} disabled={!this.state.personalEditMode}>
                                                <i className="material-icons">check_circle</i>
                                            </IconButton>
                                            <IconButton onClick={this.handlePersonalIconClick}>
                                                {personalIcon}
                                            </IconButton>
                                        </div>
                                    }
                                    title="Personal"
                                />
                                <CardContent>
                                    <Grid container spacing={24}>
                                        <Grid item xs={6}>
                                            <input type="file" key={this.state.theInputKey || '' } className={personalSaveHidden} disabled={!this.state.personalEditMode} onChange={this.handleProfilePictureChange} />
                                            <CardMedia
                                                className={classes.media}
                                                image={this.state.profilePictureUrl}
                                            />
                                            {nameHtml}
                                            <Typography variant="subheading" gutterBottom>
                                                {this.state.email}
                                            </Typography>
                                            <Button className={classNames(classes.button, personalSaveHiddenOnEdit)} variant="contained" size="small">
                                                <i className="material-icons">chat_bubble</i>
                                                <span className='lowercase_button'>Message Me</span>
                                            </Button>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Grid
                                                container
                                                direction="column"
                                                justify="center"
                                                alignItems="center"
                                            >
                                                <Grid item>
                                                    <TextField
                                                        label="Job Title"
                                                        disabled={!this.state.personalEditMode}
                                                        value={this.state.jobTitle}
                                                        onChange={(e) => this.handleChange('jobTitle', e)}
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <TextField
                                                        label="Education"
                                                        disabled={!this.state.personalEditMode}
                                                        value={this.state.education}
                                                        onChange={(e) => this.handleChange('education', e)}
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <TextField
                                                        label="Work"
                                                        disabled={!this.state.personalEditMode}
                                                        value={this.state.work}
                                                        onChange={(e) => this.handleChange('work', e)}
                                                    />
                                                </Grid>
                                                <br />
                                                <Grid item>
                                                    <IconButton disabled={!this.state.facebook_url} className={personalSaveHiddenOnEdit} onClick={this.handleSocialMediaClick}>
                                                        <img alt='facebook' src="/facebook-box.png" />
                                                    </IconButton>
                                                    <IconButton disabled={!this.state.linkedin_url} className={personalSaveHiddenOnEdit} onClick={this.handleSocialMediaClick}>
                                                        <img alt='linkedin' src="/linkedin-box.png" />
                                                    </IconButton>
                                                    <IconButton disabled={!this.state.twitter_url} className={personalSaveHiddenOnEdit} onClick={this.handleSocialMediaClick}>
                                                        <img alt='twitter' src="/twitter-box.png" />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid className={personalSaveHidden} item xs={12}>
                                            <Grid container spacing={8}>
                                                <Grid item>
                                                    <img className={personalSaveHidden} alt='facebook' src="/facebook-box.png" />
                                                </Grid>
                                                <Grid item>
                                                    <TextField
                                                        placeholder="Facebook URL"
                                                        className={personalSaveHidden}
                                                        value={this.state.facebook_url}
                                                        onChange={(e) => this.handleChange('facebook_url', e)}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={8}>
                                                <Grid item>
                                                    <img className={personalSaveHidden} alt='linkedin' src="/linkedin-box.png" />
                                                </Grid>
                                                <Grid item>
                                                    <TextField
                                                        placeholder="LinkedIn URL"
                                                        className={personalSaveHidden}
                                                        value={this.state.linkedin_url}
                                                        onChange={(e) => this.handleChange('linkedin_url', e)}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={8}>
                                                <Grid item>
                                                    <img className={personalSaveHidden} alt='twitter' src="/twitter-box.png" />
                                                </Grid>
                                                <Grid item>
                                                    <TextField
                                                        placeholder="Twitter URL"
                                                        className={personalSaveHidden}
                                                        value={this.state.twitter_url}
                                                        onChange={(e) => this.handleChange('twitter_url', e)}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
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
                                        <div>
                                            <IconButton type="submit" className={aboutSaveClassName} disabled={!this.state.aboutEditMode}>
                                                <i className="material-icons">check_circle</i>
                                            </IconButton>
                                            <IconButton onClick={this.handleAboutIconClick}>
                                                {aboutIcon}
                                            </IconButton>
                                        </div>
                                    }
                                    title="About"
                                />
                                <CardContent>
                                    <Grid container spacing={24}>
                                        <Grid item xs={12}>
                                            <Grid
                                                container
                                                direction="column"
                                                justify="center"
                                                alignItems="center"
                                            >
                                                <Grid item>
                                                    <TextField
                                                        //label="About"
                                                        multiline
                                                        className={classes.aboutTextField}
                                                        rows="6"
                                                        margin="normal"
                                                        disabled={!this.state.aboutEditMode}
                                                        value={this.state.about}
                                                        onChange={(e) => this.handleChange('about', e)}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </form>
                    </Grid>
                    <Grid item>
                        <form onSubmit={this.handleSkillSubmit} className={classes.padding}>
                            <Card className={classes.card} raised={this.state.skillEditMode}>
                                <CardHeader
                                    avatar= {
                                        <img alt='trophy' src="/trophy-variant.png" />
                                    }
                                    action={
                                        <div>
                                            <IconButton type="submit" className={skillSaveClassName} disabled={!this.state.skillEditMode}>
                                                <i className="material-icons">check_circle</i>
                                            </IconButton>
                                            <IconButton onClick={this.handleSkillIconClick}>
                                                {skillIcon}
                                            </IconButton>
                                        </div>
                                    }
                                    title="Skills"
                                />
                                <CardContent>
                                  {skillHtml}
                                </CardContent>
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