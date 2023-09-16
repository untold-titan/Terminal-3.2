import { apiUrl, gamerRoleId } from "./data/vars"

export async function handleEvent(data) {
    let command = data.data.name
    let interaction;
    if(data.message != undefined)
        interaction = data.data.custom_id
    if(command == "about"){
        respondWithEmbed(data.id, data.token, {
            "title":"Terminal 3.2 - " + Bun.env.VERSION_TYPE + " - " + Bun.env.VERSION_NUMBER,
            "type":"rich",
            "description":"Terminal 3.2 - Built by untoldtitan for The Odyssey 42",
            "color":0x00ff00
        })
        return;
    }
    if(command == "join_gamers"){
        respondWithMessage(data.id, data.token, "`Request received. Granting access to gaming wing.`")
        giveUserRole(gamerRoleId, data.guild_id, data.member.user.id)
        return;
    }
    if(command == "join_city_group"){
        respondWithInteraction(data["id"], data["token"], {
            // "content":"`Please select which city group to join`",
            "components":[
                {
                    "type":1,
                    "components":[
                        {
                            "type":3,
                            "custom_id": "role_select_cities",
                            "options":[
                                {
                                    "label":"Calgary",
                                    "value":"1150856514781859901"
                                },
                                {
                                    "label":"Lethbridge",
                                    "value":"1150856628002898030"
                                },
                                {
                                    "label":"Edmonton",
                                    "value":"1150856769975894106"
                                }
                            ]
                        }
                    ]
                }
            ]
        })
        return;
    }
    if(command == "role_color"){
        let selectedColor = data.data.options[0].value
        respondWithMessage(data.id, data.token, "`Request Received. Giving color now.`")
        const colorFile = Bun.file("data/colorRoles.json")
        const colorData = await JSON.parse(await colorFile.text())
        colorData.forEach(color => {
            if(color.name == selectedColor){
                giveUserRole(color.id, data.guild_id, data.member.user.id)
            }
        })
        return;
    }
    if(command == "create_dnd_channel"){
        console.log(data.data)
        const channelName = data.data.options[0].value
    }

    //Interaction Handling
    if(interaction == "role_select_cities"){
        respondWithMessage(data.id, data.token, "`Request Received. Adding you to the group now.`")
        giveUserRole(data.data.values[0],data.guild_id,data.member.user.id)
        return;
    }

    console.log("New Command/Interaction received! Please create the handler for it.")
    console.log(command)
    console.log(interaction)
}

function respondWithEmbed(id, token, embed){
    fetch(apiUrl + "interactions/" + id + "/" + token + "/callback",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            "type":4,
            "data":{
                "embeds":[
                    embed
                ]
            }
        })
    }).then((res) => {
        if(!res.ok)
            console.error("Failed to reply to interaction!")
        return res.ok
    })
}

function respondWithInteraction(id, token, interaction){
    fetch(apiUrl + "interactions/" + id + "/" + token + "/callback",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            "type":4,
            "data":interaction
        })
    }).then((res) => {
        if(!res.ok)
            console.error("Failed to reply to interaction!")
        console.log(res)
        return res.ok
    })
}

function giveUserRole(roleId, guildId, userId){
    fetch(apiUrl + "guilds/" + guildId + "/members/" + userId + "/roles/" + roleId,{
        method:"PUT",
        headers:{
            "Authorization":"Bot " + Bun.env.TOKEN 
        }
    }).then(res => {
        if(!res.ok)
            console.error("Failed to add role to user!")
        return res.ok
    })
}

function respondWithMessage(id,token,reply){
    fetch(apiUrl + "interactions/" + id + "/" + token + "/callback",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            "type":4,
            "data":{
                "content":reply
            }
        })
    }).then((res) => {
        if(!res.ok)
            console.error("Failed to reply to interaction!")
        return res.ok
    })
}