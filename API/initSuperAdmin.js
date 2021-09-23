const mongoose = require('mongoose');
const { MONGO_URL } = require('./config/index.js')
const DBSetup = require('./config/DBSetup.js');
const prompts = require('prompts');
const SuperAdmin = require('./models/SuperAdmin.js');
const shell = require('shelljs');
const questions = [
    {
        type: 'text',
        name: 'username',
        message: 'Enter superadmin username',
        validate: (value =>
            (new RegExp('^[A-Za-z][A-Za-z0-9_]{5,20}$')).test(value) ? true : `Username should be start with an alphabet, have at least 6 characters`
        ),
    },
    {
        type: 'text',
        name: 'password',
        message: 'Enter superadmin password',
        validate: (value =>
            (new RegExp('^(?=.*?[A-Za-z])(?=.*?[0-9]).{8,}$')).test(value) ? true : `Password should be minimum eight characters,have at least one letter and one number`
        ),
        style: 'password',
    },
    {
        type: 'text',
        name: 'confirm',
        message: 'This will clear your database. Are you sure? [Y/N]'
    }
];

(async () => {
    const response = await prompts(questions);

    if (response.confirm.toLowerCase() === 'y' || response.confirm.toLowerCase() === 'yes') {
        await createSuperAdmin(response);
        console.log('Done!');
    } else {
        console.log('Process cancelled!');
    }
})();


const createSuperAdmin = async ({ username, password }) => {

    try {
        if(process.env.NODE_ENV === 'dev'){
            shell.exec('sudo service mongod start')
        }

        await DBSetup();
        console.log("MongoDB connected for dropping.");

        console.log('Droping Database...');
        await mongoose.connection.db.dropDatabase();
        console.log('Database dropped successfully.');

        console.log('Creating new superadmin...')
        const superAdmin = new SuperAdmin({
            username,
        })
        superAdmin.setPassword(password);

        await superAdmin.save()
        console.log('New superadmin successfully created.')

        console.log('Closing the database...')
        await mongoose.connection.close();

    } catch (err) {
        console.log('Database error!');
        throw new Error(err.message);
    }
}