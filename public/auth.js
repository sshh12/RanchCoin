
class Auth {

  constructor() {

    firebase.auth().useDeviceLanguage();
    firebase.auth().onAuthStateChanged(this.onAuthChange);
    //firebase.auth().signOut()

    firebase.auth().getRedirectResult().then(function(result) {

      if (result.credential) {
        auth.token = result.credential.accessToken;
      }

    }).catch(function(error) {

      console.log(error);

    });

  }

  doLogin() {

    let provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      'login_hint': 'sXXXXXX@stu.cfisd.net'
    });

    firebase.auth().signInWithRedirect(provider);

  }

  onAuthChange(user) {

    if(!user) {

      auth.doLogin();

    } else {

      auth.user = user;
      auth.uid = auth.user.uid;

      db.ref(`users/${auth.uid}`).update({
        name: auth.user.displayName.toLowerCase(),
        firstname: auth.user.displayName.toLowerCase().split(" ")[0],
        email: auth.user.email.toLowerCase(),
        photoURL: auth.user.photoURL,
      });

      postAuthInit();

    }

  }

}
