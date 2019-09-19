var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const ETools = require('etools');
import apiInterface from './api-interface';
import apiProject from './api-project';
import LoginModel from '../models/LoginModel';
import ProjectModel from '../models/ProjectModel';
import ApiModel from '../models/ApiModel';
import FeedbackModel from '../models/FeedbackModel';
const { ResponseFormat } = require('../utils');
/* GET home page. */
const loginModel = new LoginModel();
const projectModel = new ProjectModel();
const apiModel = new ApiModel();
const feedbackModel = new FeedbackModel();
// 登录验证
router.post('/login', function(req, res) {
  const username = req.body.username;
  const password = crypto.createHash('md5').update('' + req.body.password).digest('hex');  // 先加密后验证
  const responseFormat = new ResponseFormat(res);
  loginModel.verifyLogin(username, password).then(rows => {
    if (rows.length > 0) {
      const user = rows[0];
      const token = crypto.createHash('md5').update('' + user.id).digest('hex');
      req.session.token = token;
      req.session.userInfo = user;
      req.session.userId = user.id;
      responseFormat.jsonSuccess({
        loginSuccess: true,
        userInfo: { ...{
          username: user.username,
          id: user.id,
          role: user.role
        }, token}
      });
    } else {
      responseFormat.jsonError('用户名或密码错误' + password);
    }
  }).catch(err => {
    responseFormat.jsonError(err);
  });
});
// 注册
router.post('/register', async function(req, res) {
  const responseFormat = new ResponseFormat(res);
  let requestData = {...req.body};
  // console.log(requestData);
  try {
    const resp = await loginModel.findUserByUsername(requestData.username);
    if (resp && resp.length > 0) {
      responseFormat.jsonError('该用户名已经被注册');
      return false;
    }
    const resp2 = await loginModel.findUserByEmail(requestData.email);
    if (resp2 && resp2.length > 0) {
      responseFormat.jsonError('该邮箱已经被注册');
      return false;
    }
    const pwd = crypto.createHash('md5').update('' + requestData.password).digest('hex'); // 密码加密
    requestData.password = pwd;
    const resp3 = await loginModel.register(requestData);
    if (resp3.id) {
      responseFormat.jsonSuccess({
        regSuccess: true,
      });
    } else {
      responseFormat.jsonError('注册失败');
    }
  } catch (error) {
    responseFormat.jsonError(error);
  }
});
// 退出登录
router.get('/logout', function(req, res) {
  const responseFormat = new ResponseFormat(res);
  req.session.token = null;
  req.session.userId = null;
  responseFormat.jsonSuccess({
    success: true
  });
});
// 根据用户名，邮箱搜索用户
router.get('/searchUser', async function(req, res) {
  const responseFormat = new ResponseFormat(res);
  try {
    const resp = await loginModel.searchUser(req.query.key);
    if (resp) {
      responseFormat.jsonSuccess(resp);
    } else {
      responseFormat.jsonError('搜索失败');
    }
  } catch (error) {
    responseFormat.jsonError(error);
  }
});
// 提交问题与建议
router.post('/feedback', async function(req, res) {
  const responseFormat = new ResponseFormat(res);
  const { email, content } = req.body;
  try {
    const resp = await feedbackModel.addFeedback({
      email,
      content
    });
    if (resp) {
      responseFormat.jsonSuccess(resp);
    } else {
      responseFormat.jsonError('提交失败');
    }
  } catch (error) {
    responseFormat.jsonError(error);
  }
});
// 获取首页统计信息
router.get('/countData', async function(req, res) {
  const responseFormat = new ResponseFormat(res);
  try {
    const userCount = await loginModel.countAll();
    const projectCount = await projectModel.countAllProject();
    const apiCount = await apiModel.countAll();
    responseFormat.jsonSuccess({
      users: userCount,
      projects: projectCount,
      apis: apiCount,
      mocks: parseInt(new Date().getTime() / 400000)
    });
  } catch (error) {
    responseFormat.jsonError(error);
  }
});
apiProject(router, projectModel, loginModel, apiModel, crypto);
apiInterface(router, apiModel);
module.exports = router;
