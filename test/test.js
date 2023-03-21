var MessengerCore = require("../src/MessengerCore")

var firebaseConfig = {
  apiKey: "AIzaSyCx-8LteMAbnIBMABLMpA2LIEkFio2PmmI",
  authDomain: "infinite-messenger-core.firebaseapp.com",
  projectId: "infinite-messenger-core",
  storageBucket: "infinite-messenger-core.appspot.com",
  messagingSenderId: "697151346607",
  appId: "1:697151346607:web:5ced38dcffc043181ac15a",
  measurementId: "G-HM7RP4X2TT",
}

var messenger = new MessengerCore({
  dbDriver: "firebase",
  dbConfig: "../key/key.json",
})

var test = async () => {
  // get user
  let user = await messenger.initUser("00001")
  console.log(` \n \n user ==> ${JSON.stringify(user)} \n \n \n`)

  //get conversations
  await messenger.initThreads()
  console.log(`conversations ==> ${JSON.stringify(user.conversations())} \n \n \n`)

  /**
   * listen to conversatoins
   */
  messenger.listenToConversations((conversations) => {
    console.log(`listening to conversations ==> ${conversations} \n \n \n`)
  })

  /**
 *
 messenger.newThread(
            [
                {
                    id : "00002",
                    name : "test user 2",
                    conversationsId : "conv_00002"  
                }
            ],
            {id : '123123'});

        //var testThread = messenger.user.conversations();
        //testThread["123123"].listen();
        //testThread.sendMessage({senderId : messenger.user.getId(), content : "test from ui - for thread 123123"});
        //console.log(messenger)
*/
}

test()
