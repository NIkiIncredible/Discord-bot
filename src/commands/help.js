const main = require('../index');

const client = main.client;

// client.api.applications(client.user.id).commands.post({
//     data: {
//         name: 'music',
//         description: 'Verwalte den Musikbot.',
//         options: [
//             {
//                 name: "play",
//                 description: "Spiele musik über den bot ab.",
//                 type: 2, // 2 is type SUB_COMMAND_GROUP
//                 options: [
//                     {
//                         name: "link",
//                         description: "Spiele musik von Youtube ab.",
//                         type: 3,
//                         required: true
//                     },
//                 ]
//             },
//             // {
//             //     name: "role",
//             //     description: "Get or edit permissions for a role",
//             //     type: 2
//             // }
//         ]
//     }
// })