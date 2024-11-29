const { MongoClient, ObjectId } = require('mongodb');

async function validateAndFixMentionedArrays() {
  const uri = 'mongodb://appUser:appPassword@it2810-06.idi.ntnu.no:27017/myAppDB?authSource=myAppDB';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('myAppDB');
    const notificationsCollection = database.collection('notifications');
    const usersCollection = database.collection('users');

    // Fetch all posts
    const notifications = await notificationsCollection.find({}).toArray();

    for (const notification of notifications) {
      const sender = await usersCollection.findOne({ _id: new ObjectId(notification.sender) });

      if (!sender) await notificationsCollection.deleteOne({ _id: new ObjectId(notification._id) });
    }
    console.log('Validation and update complete!');
  } catch (err) {
    console.error('Error during validation and update:', err);
  } finally {
    await client.close();
  }
}

validateAndFixMentionedArrays();
