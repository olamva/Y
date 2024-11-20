const { MongoClient } = require('mongodb');

async function validateAndFixAmtReposts() {
  const uri = 'mongodb://appUser:appPassword@it2810-06.idi.ntnu.no:27017/myAppDB?authSource=myAppDB';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('myAppDB');
    const postsCollection = database.collection('posts');
    const usersCollection = database.collection('users');
    const repostsCollection = database.collection('reposts');

    // Fetch all posts
    const posts = await postsCollection.find({}).toArray();

    for (const post of posts) {
      // Get the number of users who have the post ID in their repostedPostIds
      const repostCount = await usersCollection.countDocuments({
        repostedPostIds: { $in: [post._id.toString()] },
      });
      // Find users who have reposted the post
      const users = await usersCollection
        .find({
          repostedPostIds: { $in: [post._id.toString()] },
        })
        .toArray();

      for (const user of users) {
        const repost = await repostsCollection.findOne({
          originalID: post._id,
          author: user._id,
        });

        if (!repost) {
          // decrement the post's amtReposts and remove the post ID from the user's repostedPostIds
          console.log(`Repost not found for post ID: ${post._id} and user ID: ${user._id}.`);

          // await postsCollection.updateOne({ _id: post._id }, { $inc: { amtReposts: -1 } });
          // await usersCollection.updateOne(
          //   { _id: user._id },
          //   { $pull: { repostedPostIds: post._id.toString() } }
          // );
        }
      }
      if (post.amtReposts !== repostCount) {
        console.log(`Mismatch for post ID: ${post._id}. Updating amtReposts to ${repostCount}.`);
      }
    }

    console.log('Validation and update complete!');
  } catch (err) {
    console.error('Error during validation and update:', err);
  } finally {
    await client.close();
  }
}

validateAndFixAmtReposts();
