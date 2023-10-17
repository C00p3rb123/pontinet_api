import chai from ('chai');
import chaiHttp from ('chai-http');
import sinon from "sinon"
import { hashPassowrd } from ('../src/utils/reigstration.services'); // Adjust the path accordingly
import  db  from "../src/database/db"; // Adjust the path accordingly
import  app from "../src/app" // Adjust the path accordingly

chai.use(chaiHttp);
const expect = chai.expect;

describe('POST /account', () => {
  beforeEach(() => {
    // Set up any necessary stubs or mocks here
    sinon.stub(db, 'isUser').resolves(null);
    sinon.stub(db, 'insert').resolves();
    sinon.stub(global, 'hashPassowrd').resolves('hashedPassword');
  });

  afterEach(() => {
    // Restore stubs or mocks after each test
    sinon.restore();
  });

  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      mobile: '1234567890'
    };

    const response = await chai
      .request(app)
      .post('/account')
      .send(userData);

    expect(response).to.have.status(200);
    expect(response.body).to.deep.equal({
      Message: `User with email ${userData.email} has been successfully created`
    });

    // Ensure that the database functions were called correctly
    sinon.assert.calledOnce(db.isUser);
    sinon.assert.calledOnce(db.insert);
    sinon.assert.calledOnce(hashPassowrd);
  });

  it('should handle existing user', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'password123',
      mobile: '1234567890'
    };

    // Stub isUser to simulate an existing user
    sinon.stub(db, 'isUser').resolves({ /* existing user data */ });

    const response = await chai
      .request(app)
      .post('/account')
      .send(userData);

    expect(response).to.have.status(400);
    expect(response.body).to.deep.equal({
      error: true,
      message: 'User already exists'
    });

    // Ensure that isUser was called correctly
    sinon.assert.calledOnce(db.isUser);
    sinon.assert.notCalled(db.insert);
    sinon.assert.notCalled(hashPassowrd);
  });

  it('should handle incomplete request body', async () => {
    const incompleteUserData = {
      // Missing required fields
    };

    const response = await chai
      .request(app)
      .post('/account')
      .send(incompleteUserData);

    expect(response).to.have.status(400);
    expect(response.body).to.deep.equal({
      error: true,
      message: 'Request body incomplete, email, password and mobile are required'
    });

    // Ensure that isUser, insert, and hashPassword were not called
    sinon.assert.notCalled(db.isUser);
    sinon.assert.notCalled(db.insert);
    sinon.assert.notCalled(hashPassowrd);
  });
});
