/* global http */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Tooltip, Icon } from 'antd';
import './style.scss';
const FormItem = Form.Item;
const { TextArea } = Input;
class ProjectForm extends Component {
  state = {
    submitLoading: false
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields(async(err, formData) => {
      if (!err) {
        this.setState({
          submitLoading: true
        });
        const resp = await http.post('/api/project/add', formData);
        this.setState({
          submitLoading: false
        });
        if (resp.success) {
          this.props.refreshList('create');
          this.props.closeModal();
        }
      }
    });
  }
  validBaseUrl = (rule, value, callback) => {
    if (/^\/[a-zA-Z0-9]+$/.test(value)) {
      callback();
    } else {
      callback('请输入正确的项目根路径如：“/shop01”'); // eslint-disable-line
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="modal-form">
        <FormItem label="项目名称">
          {getFieldDecorator('name', {
            rules: [{ required: true, message: '请填写项目名称' }, { max: 20, message: '项目名称不能大于20个字符' }]
          })(
            <Input autoComplete="off" placeholder="项目名称" />
          )}
        </FormItem>
        <FormItem label={(
          <span>接口基础路径&nbsp;
            <Tooltip placement="right" title="接口基础路径为“/”开头有字母或数字组成的字符串如：“/shop01”不能有多个“/”">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        )}>
          {getFieldDecorator('baseurl', {
            rules: [
              { required: true, message: '请填写接口基础路径' }, { max: 20, message: '项目基础路径不能大于20个字符' },
              { validator: this.validBaseUrl }
            ]
          })(
            <Input autoComplete="off" placeholder="接口基础路径" />
          )}
        </FormItem>
        <FormItem label="项目描述">
          {getFieldDecorator('description', {
            rules: [{ required: true, message: '请填写项目描述' }]
          })(
            <TextArea rows={4} placeholder="项目描述" />
          )}
        </FormItem>
        <FormItem style={{ marginTop: '15px', textAlign: 'center' }}>
          <Button style={{ width: '120px' }} loading={this.state.submitLoading} type="primary" htmlType="submit">
            提交
          </Button>
        </FormItem>
      </Form>
    );
  }
};
const ProjectFormWithRouter = withRouter(ProjectForm);
export default ProjectFormWithRouter;
