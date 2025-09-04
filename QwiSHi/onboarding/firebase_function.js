
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

exports.onboardContractor = functions.https.onRequest(async (req, res) => {
  const { name, address, phone, email, availability, skills } = req.body;

  try {
    const contractorRef = admin.firestore().collection('pending_verification').doc();
    await contractorRef.set({
      name,
      address,
      phone,
      email,
      availability,
      skills: skills.split(',').map(s => s.trim()),
      square_verification_status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const squareResponse = await axios.post('https://api.squareup.com/v2/identity/verify', {
      name,
      address,
      phone,
      email,
    }, {
      headers: {
        Authorization: `Bearer ${functions.config().square.token}`,
        'Content-Type': 'application/json',
      },
    });

    await contractorRef.update({
      square_verification_status: squareResponse.data.status || 'submitted',
    });

    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error onboarding contractor:', error);
    res.status(500).send({ error: 'Failed to onboard contractor.' });
  }
});
