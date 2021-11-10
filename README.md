# infinite-messenger-core
core library for real-time messaging apps built with firebase/MongoDB

## About
  Building person to person messaging feature, is something which we have to consider many things ranging from db schema to proper storing/retrieval of conversation,messages. In fact it takes a considarable amount of time and effort to build/test one from scratch. I built this library as  a solution to those problems, so everyone can put their effort on implementing important business logic of their applications. This library contains all necessary functions to,

  - read and write new conversations
  - read and write new messages
  - listening to the updates of the conversations,messages.

  Hope this library helps you.

## Installation

Install the package with npm

- `npm install @maleeshagimshan98/infinite-messenger-core `

## Getting Started

#### Important
 I reccomend using a seperate mongoDB database or firebase project for this messaging feature.

To start using this library, Import the package, create a new instance of `MessengerCore` and initialize user with `initUser()`. All required methods are described below.

**Example**

````
import MessengerCore from 'infinite-messenger-core';

let firebaseConfig = { /*firebase configuration object*/ };

//... your application
let messenger = new MessengerCore({dbDriver : 'firebase',dbConfig : firebaseConfig});

 //... get user object from database (firebase/mongoDB),
 //... returns false in case user does not exists.
let user = await messenger.initUser(/*user id*/);


````


## Methods

Below are a list of methods available to consume.

- **`initUser(userId)`** - *retrieve user from database, **returns false if user not exist**

    - userId - user's id
    - *returns* - void

- **`newUser(user)`** - *create a new user and store in the database*
    - user - user object (refer to User section for more details)

- **`initThreads()`**  - *retrieve user's conversations from database*

- **`listenToConversations(callback)`** - *listen to user's conversation updates. the passed callback is called whenever conversation update*

    - callback - callback function

- **`newThread(participants,thread)`** - *start a new conversation*

    - participants - Array of participating user data objects 
    - thread - object containing conversation id set by you


### User

This library expects the users to be stored previousely in the database (firestore/mongoDB) for this particular library.

The user object should be in the following format.

````
  let user = {
      id : '', // string
      name : '',
      conversationsId : '' //... optional, if not provided, 'conv_' + id will be the default
      profileImg : '', //... url to profile image - optional (default = ''),
      permissions : [], //... optional (not used in the library)
      isActive : false,
      lastSeen : ''
  };

````

If user does not exists in the database, create a user with `newUser()`. See example below,

````
let user = await messenger.initUser(userId);

if (!user) {
    await messenger.newUser({
        id : '',
        name : '',
        profileImg : '',
    });
}

````

### Retrieve conversations

Once you initialized the `MessengerCore`, get user from database with `initUser(userId)`.
To get user's conversation once, call `initThreads()`. To get updates continuesly, call `listenToConversations(callback)` instead.

Received conversations (if any) are accessible via `user.conversations()` method.

**example**

````
let messenger = new MessengerCore({dbDriver : 'firebase',dbConfig : firebaseConfig});

await messenger.initUser(userId);
await messenger.initThreads();

let conversations = messenger.user.conversations(); //... get received conversations

/**
    ============= example conversations object ==================

    conversations = [
        {
            id : '12345612',
            participants : ['00001','00002'],
            started : '',
            lastUpdated : '',
            messages : []
        }
    ];

*/

````

### Create new conversation

call `newThread()` method as follows. This saves the conversation data for all participants.

````
    messenger.newThread(
        [
            //... user object
            {
                id : "00002",
                name : "test user 2",
                conversationsId : "conv_00002"  
            }
        ],
        {id : '123123'} //... object with conversation id
    );

````

### Get messages in a conversation

call listen() on **conversation object** to get new messages. Pass a callback function if you need to do something everytime new message arrive. updated messages object (with all messages) is passed to the callback as the first argument.

````
    let conversations = messenger.user.conversations(); //... get received conversations

    let chatWithFoo = conversations['foo']; //... conversation you want to listen for new messages

    chatWithFoo.listen(messages => {
        //... do something with messages
    });

````

### Send messages

call `sendMessage()` in **conversation object** to send a message.

**example**

````
    let conversations = messenger.user.conversations(); //... get received conversations

    let chatWithFoo = conversations['foo']; //... conversation you want to send message

    await chatWithFoo.sendMessage(
        {
            senderId : messenger.user.getId(),
            content : "test from ui - for thread 123123"
        });

````


## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request


## Licence
Distributed under the MIT License

## Contact

- email - (maleeshagimshan74@gmail.com)
