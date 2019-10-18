<template>
  <div>
    <Modal v-model="status" :mask-closable="false" :closable="false" :title="title()">
      <Form ref="formDialog" :model="formData" label-position="left" :label-width="100">
        <FormItem
          label="Desc"
          prop="desc"
          :rules="{required: true,message: 'The desc cannot be empty'}"
        >
          <Input v-model="formData.desc"></Input>
        </FormItem>
        <FormItem label="Key">
          <Input v-model="formData.key" :disabled="formData.type=='roundrobin'"></Input>
        </FormItem>

        <FormItem label="Type">
          <Select clearable v-model="formData.type" @on-change="upstreamTypeChange">
            <Option
              v-for="(item,index) in upstreamTypeList"
              :value="item.value"
              :key="index"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem>
          <Button @click="addNodes">添加Node</Button>
        </FormItem>
        <FormItem
          :label="'node'+(index+1)"
          v-for="(item,index) in formData.upstreamNodeList"
          :key="index"
        >
          <Row>
            <Col span="8">
              <FormItem
                :rules="{required: true, message: 'ip can not be empty',type:'string'}"
                :prop="'upstreamNodeList.' + index + '.ip'"
              >
                <Input v-model="item.ip" size="large" placeholder="IP" />
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem
                style="margin-left:5px"
                :rules="{required: true, message: 'port can not be empty'}"
                :prop="'upstreamNodeList.' + index + '.port'"
              >
                <Input v-model="item.port" type="number" size="large" placeholder="Port" />
              </FormItem>
            </Col>
            <Col span="6">
              <FormItem
                style="margin-left:5px"
                :rules="{required: true, message: 'weights can not be empty'}"
                :prop="'upstreamNodeList.' + index + '.weights'"
              >
                <InputNumber
                  v-model="item.weights"
                  :max="200"
                  :min="1"
                  size="large"
                  type="number"
                  placeholder="Weights"
                />
              </FormItem>
            </Col>
            <Col span="4">
              <Button
                style="margin-top:3px"
                icon="md-close"
                type="warning"
                @click="removeNode(index)"
              ></Button>
            </Col>
          </Row>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="closeDialog">取消</Button>
        <Button type="primary" size="large" :loading="submitStatus" @click="submitForm">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Tables from "_c/tables";
import { Form } from "iview";
import {
  getUpstreamsData,
  getUpstreamsList,
  addUpstream,
  deleteUpstream,
  updateUpstream
} from "@/api/data";
export default {
  name: "apisixUpstream",
  components: {
    Tables
  },
  props: {
    status: Boolean,
    editId:String
  },
  data() {
    return {
      submitStatus: false,
      formData: {
        desc:'',
        type: "roundrobin",
        upstreamNodeList: [],
        nodes: {}
      },
      upstreamTypeList: [
        {
          value: "roundrobin",
          label: "roundrobin"
        },
        {
          value: "chash",
          label: "chash"
        }
      ],
      isEditUpstreamStatus: false,
      upstreamList: [],
    };
  },
  methods: {
    /**
     * 提交保存
     */
    submitForm() {
      this.$refs["formDialog"].validate(valid => {
        if (!valid) {
          return;
        }

        this.formData.nodes = {};
        for (
          let index = 0;
          index < this.formData.upstreamNodeList.length;
          index++
        ) {
          this.formData.nodes[
            this.formData.upstreamNodeList[index].ip +
              ":" +
              this.formData.upstreamNodeList[index].port
          ] = this.formData.upstreamNodeList[index].weights;
        }

        let _data = this.formData;
        delete _data.upstreamNodeList;

        //更新
        if (this.isEditUpstreamStatus) {
          let id = _data.id.match(/\/([0-9]+)/)[1];
          delete _data.id;
          updateUpstream(id, _data)
            .then((res, t) => {
              this.closeDialog();
              this.isEditUpstreamStatus = false;
              this.submitStatus = false;
              this.initFormData();
            })
            .catch((e) => {
              this.submitStatus = false;
              this.$Notice.error({
                title: "操作失败",
                desc: e.response.data.error_msg
              });
            });
          return;
        }

        //新增
        addUpstream(_data)
          .then((res, t) => {
            this.closeDialog();
            this.isEditUpstreamStatus = false;
            this.submitStatus = false;
            this.initFormData();
          })
          .catch((e) => {
            this.submitStatus = false;
            this.$Notice.error({
              title: "操作失败",
              desc: e.response.data.error_msg
            });
          });
      });
    },

    upstreamTypeChange(data) {
      if (data == "roundrobin") {
        this.formData.key = "";
      }
    },

    removeNode(index) {
      if(this.formData.upstreamNodeList.length==1){
        return false;
      }
      this.formData.upstreamNodeList.splice(index, 1);
    },

    addNodes() {
      this.formData.upstreamNodeList.push({
        ip: "",
        port: "",
        weights: 1
      });
      console.log(this.formData);
    },
    title(){
      if(this.isEditUpstreamStatus){
        return "编辑 Upstream";
      }
      return "添加 Upstream";
    },
    edit(id) {
      //upstream进入编辑模式
      this.isEditUpstreamStatus = true;
      getUpstreamsData(id).then(res => {
        this.initFormData();
        this.formData.desc = res.data.node.value.desc;
        this.formData.id = res.data.node.key;
        var _e = [];
        for (const key in res.data.node.value.nodes) {
          _e = key.split(":");
          this.formData.upstreamNodeList.push({
            ip: _e[0],
            port: _e[1],
            weights: res.data.node.value.nodes[key]
          });
        }
        console.log(this.formData);
      });
    },
    initFormData() {
      // this.formData.type = "roundrobin";
      this.formData.upstreamNodeList = [];
      this.formData.nodes = {};
      this.formData.desc = "";
      // this.$refs["formDialog"].resetFields();
    },
    closeDialog(){
      this.$emit("on-status",false);
    }
  },
  watch: {
    editId(id) {
      this.edit(id);
    },
    status(_status){
        this.initFormData();
    }
  },
  mounted() {}
};
</script>

<style>
</style>
