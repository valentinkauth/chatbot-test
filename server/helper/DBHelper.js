module.exports = {
    getUserData: function (controller, user_id) {
        // Access user data from DB
        const items = await controller.storage.read([user_id]);
        const storageUserData = items[user_id] || {};

        var userData = {
            userName = this.getUserName(storageUserData),
            firstName = this.getFirstName(storageUserData),
            lastName = this.getLastName(storageUserData),
            nickName = this.getNickName(storageUserData),

            questionnaires = this.getQuestionnaires


        }




        // Check if user data available and set nick name
        if (userData.user_info && userData.user_info.nick_name) {
            userName = userData.user_info.nick_name
        }

        return userData;

    },

    getNickName(userData) {

        var nickName = "undefined nick name"

        if (Object.keys(userData).length) {
            if (userData.user_info) {
                if ("nick_name" in userData.user_info) {
                    nickName = userData.user_info.nick_name
                } 
                // Use first name as nick name if no nick name is defined
                else if ("first_name" in userData.user_info) {
                    nickName = userData.user_info.first_name
                }
            }
        }

        return nickName;

    },

    getFirstName(userData) {

        var firstName = "undefined first name"

        if (Object.keys(userData).length) {
            if (userData.user_info) {
                if ("first_name" in userData.user_info) {
                    firstName = userData.user_info.first_name
                } 
            }
        }
        return firstName;
    },

    getLastName(userData) {
        
        var lastName = "undefined last name"

        if (Object.keys(userData).length) {
            if (userData.user_info) {
                if ("last_name" in userData.user_info) {
                    lastName = userData.user_info.last_name
                } 
            }
        }
        return lastName;
    },

    getUserName(userData) {
        
        var userName = "undefined user name"

        if (Object.keys(userData).length) {
            if (userData.user_info) {
                if ("user_name" in userData.user_info) {
                    userName = userData.user_info.user_name
                } 
            }
        }
        return userName;
    },

    storeUserData: function (controller) {

    },


    storeAnswer: function (controller) {

    },
}