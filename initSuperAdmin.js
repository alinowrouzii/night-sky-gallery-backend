const prompts = require('prompts');

const questions = [
    {
        type: 'text',
        name: 'username',
        message: 'Enter superadmin username'
    },
    {
        type: 'text',
        name: 'password',
        message: 'Enter superadmin password',
        validate: (value =>
            (new RegExp('^(?=.*?[A-Za-z])(?=.*?[0-9]).{8,}$')).test(value) ? true : `Password should be minimum eight characters,have at least one letter and one number`
        ),
        style: 'password',
    }
];

(async () => {
    const response = await prompts(questions);
    console.log(response)
    // console.log(process.argv)

    // createSuperAdmin(response);
})();