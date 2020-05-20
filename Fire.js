import FirebaseKeys from './config';
import firebase from 'firebase';
import { ThemeColors } from 'react-navigation';
require('firebase/firestore');

class Fire {
  constructor() {
    firebase.initializeApp(FirebaseKeys);
  }

  addPost = async ({ text, localUri }) => {
    const remoteUri = await this.uploadPhotoAsync(
      localUri,
      `photos/${this.uid}/${Date.now()}`
    );

    return new Promise((res, rej) => {
      

      this.database.ref("users").child(this.uid).once('value',(snapshot) => {
        var {name,avatar} = snapshot.val();
        
      

      var data = {
        text,
        uid: this.uid,
        timestamp: this.timestamp,
        image: remoteUri,
        name,
        avatar
      }

      this.database.ref("posts").push(data)
      .then(ref => res(ref))
      .catch(err => rej(err));
      })

    }) 
    
  };

  uploadPhotoAsync = async (uri, filename) => {
    return new Promise(async (res, rej) => {
      const response = await fetch(uri);
      const file = await response.blob();

      let upload = firebase
        .storage()
        .ref(filename)
        .put(file);

      upload.on(
        "state_changed",
        snapshot => {},
        err => {
          rej(err);
        },
        async () => {
          const url = await upload.snapshot.ref.getDownloadURL();
          res(url);
        }
      );
    });
  };

  createUser = async user => {
    let remoteUri = null;

    try {
      var id = (await firebase.auth().createUserWithEmailAndPassword(user.email, user.password)).user.uid
        
      let db = this.database.ref("users");

      var data = {name: user.name,email: user.email,avatar: user.avatar}
      
      if (user.avatar) {
        remoteUri = await this.uploadPhotoAsync(
          user.avatar,
          `avatars/${this.uid}`
        )

        data.avatar = remoteUri;

      }
      db.child(id).set(data);

      

    } catch (error) {
      alert("Error: ", error);
    }
  };

  signOut = () => {
    firebase.auth().signOut();
  };

  getProfile = () => {
   return new Promise ((resolve , reject) => {
    this.database.ref("users").child(this.uid).once('value',(snapshot) => {
        resolve(snapshot.val());
    })
   })
    
  }

  get firestore() {
    return firebase.firestore();
  }

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }

  get timestamp() {
    return Date.now();
  }

  get database(){
    return firebase.database();
  }
  
  listData = () =>{
    return new Promise((resolve,reject) => {
      this.database.ref('posts').on('value',(snapshot) => {
        
        var data = Object.values(snapshot.val());
        console.log(data)

        resolve(data);
      })
    })
      
   
  }
}

Fire.shared = new Fire();
export default Fire;