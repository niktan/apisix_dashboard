<template>
  <div>
    <Modal :mask-closable="false" v-model="addRouterDialogStatus" title="添加路由">
      <Form :model="formData" ref="formDialog" label-position="left" :label-width="100">
        <FormItem
          label="Desc"
          prop="desc"
          :rules="{required: true,message: 'The desc cannot be empty'}"
        >
          <Input v-model="formData.desc"></Input>
        </FormItem>
        <FormItem
          label="URI"
          prop="uri"
          :rules="{required: true,message: 'The uri cannot be empty'}"
        >
          <Input v-model="formData.uri"></Input>
        </FormItem>
        <FormItem label="Host">
          <Input v-model="formData.host"></Input>
        </FormItem>
        <FormItem label="Remote Address">
          <Input v-model="formData.remote_addr"></Input>
        </FormItem>
        <FormItem label="Methods" prop="interest">
          <CheckboxGroup v-model="formData.methods">
            <Checkbox label="GET"></Checkbox>
            <Checkbox label="POST"></Checkbox>
            <Checkbox label="PUT"></Checkbox>
            <Checkbox label="DELETE"></Checkbox>
            <Checkbox label="PATCH"></Checkbox>
            <Checkbox label="HEAD"></Checkbox>
            <Checkbox label="OPTIONS"></Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem label="Upstream">
          <Row>
            <Col span="18">
              <Select clearable v-model="upstream_id" v-if="upstreamList.length>0">
                <Option value disabled="true" style="border-bottom:1px dashed #ccc"></Option>
                <Option value="__NEW_UPSTREAM__" style="text-align:center">新建 Upstream</Option>
                <Option value disabled="true" style="border-top:1px dashed #ccc"></Option>
                <Option
                  v-for="(item,index) in upstreamList"
                  :value="item.value"
                  :key="index"
                >{{ item.label }}</Option>
              </Select>
            </Col>
            <Col span="6">
              <Button v-show="formData.upstream_id" style="margin-left:5px" @click="showSelectUpstreamData">查看属性</Button>
            </Col>
          </Row>

          <ApisixUpstream @on-status="upstreamDialogStatusChange" :status="upstreamDialogStatus"></ApisixUpstream>
        </FormItem>
        <FormItem label="Service">
          <Select clearable v-model="formData.service_id">
            <Option
              v-for="(item,index)  in servicesList"
              :value="item.value"
              :key="index"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="Plugins">
          <ApisixPlugins :defaultPlugins="plugins" @on-change="updateChangePlugins"></ApisixPlugins>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="closeDialog">取消</Button>
        <Button type="primary" size="large" :loading="submitStatus" @click="submitForm">确定</Button>
      </div>
    </Modal>

    <div ref="elementBody">
      <Card>
        <div style="margin-bottom:10px">
          <Button @click="addShowRouterDialog">添加路由</Button>
        </div>

        <div class="search-con search-con-top">
          <Select v-model="searchKey" class="search-col">
            <Option
              v-for="item in columns"
              v-if="item.key !== 'handle'"
              :value="item.key"
              :key="`search-col-${item.key}`"
            >{{ item.title }}</Option>
          </Select>
          <Input
            @on-change="handleClear"
            clearable
            placeholder="输入关键字搜索"
            class="search-input"
            v-model="searchValue"
          />
          <Button @click="handleSearch" class="search-btn" type="primary">
            <Icon type="search" />&nbsp;&nbsp;搜索
          </Button>
        </div>

        <Tables
          ref="table"
          :height="tableHeight"
          v-model="tableData"
          :columns="columns"
          :border="true"
          :stripe="true"
        />
        <Modal :mask-closable="false" v-model="showSelectUpstreamDataStatus" title="Upstream 属性">
          <p style="padding:5px 0">
            Desc:
            {{selectUpstreamData.value.desc}}
          </p>
           <p style="padding:5px 0">
            Type:
            {{selectUpstreamData.value.type}}
          </p>

           <p style="padding:5px 0">
            Key:
            {{selectUpstreamData.value.key}}
          </p>

          <Table :columns="selectUpstreamDataColumns" :data="selectUpstreamDataColumnsData"></Table>
        </Modal>
      </Card>
    </div>
  </div>
</template>

<script>
import Tables from "_c/tables";
import { Form } from "iview";
import ApisixPlugins from "_c/apisixPlugins";
import ApisixUpstream from "_c/apisixUpstream";
import {
  getRoutersData,
  getUpstreamsList,
  getServicesList,
  addRouters,
  getRoutersList,
  deleteRouter,
  updateRouter
} from "@/api/data";
export default {
  name: "routers_page",
  components: {
    Tables,
    Form,
    ApisixPlugins,
    ApisixUpstream
  },
  data() {
    return {
      selectUpstreamDataColumns: [
        {
          title: "Ip",
          key: "ip"
        },
        {
          title: "Port",
          key: "port"
        },
        {
          title: "Weights",
          key: "weights"
        }
      ],
      selectUpstreamData: { value: {} },
      selectUpstreamDataColumnsData: [],
      showSelectUpstreamDataStatus: false,
      upstream_id: "",
      upstreamDialogStatus: false,
      value: [],
      submitStatus: false,
      searchValue: "",
      searchKey: "",
      plugins: {},
      tableHeight: null,
      //提交保存的路由数据
      formData: {
        desc: "",
        // host: "",
        uri: "",
        // remote_addr: "",
        // methods: [],
        // upstream_id: "",
        // service_id: "",
        plugins: {}
      },
      //路由配置窗口状态
      addRouterDialogStatus: false,
      //路由编辑状态
      isEditRouterStatus: false,
      //插件配置窗口状态
      pluginsDialog: false,
      //获取的所有上游列表
      upstreamList: [],
      //获取的所有服务列表
      servicesList: [],
      //获取的所有插件列表
      pluginsList: [],
      //动态增加的插件列表
      addPluginsList: [],
      //当前选中配置的插件名称
      selectPluginName: "",
      //当前选中配置的插件相关字段数据
      selectPluginField: {},
      //插件配置清单
      schema: {},

      columns: [
        { title: "id", key: "id", sortable: true, fixed: "left", width: 180 },
        { title: "desc", key: "desc", width: 150 },
        { title: "uri", key: "uri", minWidth: 100 },
        { title: "host", key: "host", width: 150 },
        { title: "remote_addr", key: "remote_addr", width: 150 },
        { title: "upstream_id", key: "upstream_id", width: 150 },
        { title: "service_id", key: "service_id", width: 150 },
        {
          title: "methods",
          key: "methods",
          width: 150
          //  render: (h, params) => {
          //   var t = [];
          //   for (let index = 0; index < params.row.methods.length; index++) {
          //     t.push(h("Tag", {}, params.row.methods[index]));
          //   }
          //   return t;
          // }
        },
        {
          title: "plugins",
          key: "plugins",
          width: 200
          // render: (h, params) => {
          //   var t = [];
          //   for (let index = 0; index < params.row.plugins.length; index++) {
          //     t.push(h("Tag", {}, params.row.plugins[index]));
          //   }
          //   return t;
          // }
        },
        {
          title: "操作",
          key: "handle",
          fixed: "right",
          width: 150,
          button: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.edit(params.tableData[params.index]);
                    }
                  }
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: "确认删除",
                        content:
                          "<p> " +
                          params.tableData[params.index].desc +
                          "</p><p> " +
                          params.tableData[params.index].id +
                          " </p><p>" +
                          params.tableData[params.index].uri +
                          "</p>",
                        loading: true,
                        onOk: () => {
                          deleteRouter(params.tableData[params.index].id)
                            .then(res => {
                              this.$Modal.remove();
                              this.$Message.success("Has Deleted!");
                              this.init();
                            })
                            .catch((e, res) => {
                              this.$Modal.remove();
                              this.$Notice.error({
                                title: "操作失败",
                                desc: e.response.data.error_msg
                              });
                            });
                        }
                      });
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      tableData: []
    };
  },
  methods: {
    initFormData() {
      this.formData.desc = "";
      // this.formData.host = "";
      this.formData.uri = "";
      // this.formData.remote_addr = "";
      // this.formData.methods = [];
      // this.formData.upstream_id = "";
      // this.formData.service_id = "";
      this.formData.plugins = {};
      this.addPluginsList = [];
      this.plugins = {};
    },
    closeDialog() {
      this.addRouterDialogStatus = false;
      this.initFormData();
    },
    upstreamDialogStatusChange(status) {
      this.upstreamDialogStatus = status;
      //当 添加upstream关闭的时候，重新获取upstream 数据
      if (!status) {
        this.doGetUpstreamsList();
      }
    },
    updateChangePlugins(data) {
      this.formData.plugins = data;
    },
    addShowRouterDialog() {
      this.initFormData();
      this.addRouterDialogStatus = true;
    },
    doGetUpstreamsList() {
      getUpstreamsList().then(res => {
        this.upstreamList = [];
        var _data = [];
        for (var i = 0; i < res.data.node.nodes.length; i++) {
          this.upstreamList.push({
            value: res.data.node.nodes[i].key.match(/\/([0-9]+)/)[1],
            label: res.data.node.nodes[i].value.desc,
            data: res.data.node.nodes[i]
          });
        }
      });
    },
    //初始化
    init() {
      this.servicesList = [];
      this.pluginsList = [];
      this.tableData = [];
      this.doGetUpstreamsList();
      getServicesList().then(res => {
        for (var i = 0; i < res.data.node.nodes.length; i++) {
          this.servicesList.push({
            value: res.data.node.nodes[i].key.match(/\/([0-9]+)/)[1],
            label: res.data.node.nodes[i].value.desc
          });
        }
      });

      getRoutersList().then(res => {
        var _data = {};
        for (var i = 0; i < res.data.node.nodes.length; i++) {
          _data = {
            id: res.data.node.nodes[i].key.match(/\/([0-9]+)/)[1],
            uri: res.data.node.nodes[i].value.uri,
            plugins: "",
            methods: "",
            upstream_id: "",
            remote_addr: "",
            host: "",
            desc: "",
            service_id: ""
          };

          if (res.data.node.nodes[i].value.remote_addr) {
            _data.remote_addr = res.data.node.nodes[i].value.remote_addr;
          }
          if (res.data.node.nodes[i].value.upstream_id) {
            _data.upstream_id = res.data.node.nodes[i].value.upstream_id;
          }
          if (res.data.node.nodes[i].value.desc) {
            _data.desc = res.data.node.nodes[i].value.desc;
          }

          if (res.data.node.nodes[i].value.service_id) {
            _data.service_id = res.data.node.nodes[i].value.service_id;
          }
          if (res.data.node.nodes[i].value.host) {
            _data.host = res.data.node.nodes[i].value.host;
          }

          if (res.data.node.nodes[i].value.plugins) {
            _data.plugins = [];
            for (const key in res.data.node.nodes[i].value.plugins) {
              // _data.plugins.push(key);
              _data.plugins += key + " ";
            }
          }
          if (res.data.node.nodes[i].value.methods) {
            for (const key in res.data.node.nodes[i].value.methods) {
              _data.methods += res.data.node.nodes[i].value.methods[key] + " ";
              // _data.methods.push(res.data.node.nodes[i].value.methods[key]);
            }
          }
          this.tableData.push(_data);
        }
        this.value = this.tableData;
      });
    },
    /**
     * 提交路由保存
     */
    submitForm() {
      this.$refs["formDialog"].validate(valid => {
        if (!valid) {
          return;
        }
        //更新
        if (this.isEditRouterStatus) {
          let key = this.formData.key.match(/\/([0-9]+)/)[1];
          delete this.formData.key;
          updateRouter(key, this.formData)
            .then((res, t) => {
              this.$Notice.success({
                title: "操作成功",
                desc: "操作成功"
              });
              this.addRouterDialogStatus = false;
              this.isEditRouterStatus = false;
              this.submitStatus = false;
              this.init();
            })
            .catch((e, res) => {
              this.submitStatus = false;
              this.$Notice.error({
                title: "操作失败",
                desc: e.response.data.error_msg
              });
            });
          return;
        }

        //新增
        addRouters(this.formData)
          .then((res, t) => {
            this.$Notice.success({
              title: "操作成功",
              desc: "操作成功"
            });
            this.addRouterDialogStatus = false;
            this.isEditRouterStatus = false;
            this.submitStatus = false;
            this.init();
          })
          .catch((e, res) => {
            this.submitStatus = false;
            this.$Notice.error({
              title: "操作失败",
              desc: e.response.data.error_msg
            });
          });
      });
    },

    //路由进入编辑模式
    edit(routeData) {
      this.isEditRouterStatus = true;
      this.addRouterDialogStatus = true;
      getRoutersData(routeData.id).then(res => {
        this.formData = res.data.node.value;
        this.formData.key = res.data.node.key;
        this.plugins = this.formData.plugins;
      });
    },
    handleClear(e) {
      if (e.target.value === "") this.tableData = this.value;
    },
    handleSearch() {
      this.tableData = this.value.filter(
        item => item[this.searchKey].indexOf(this.searchValue) > -1
      );
    },
    showSelectUpstreamData() {
      this.showSelectUpstreamDataStatus = true;
      this.selectUpstreamDataColumnsData = [];
      this.selectUpstreamData = {};
      for (let index = 0; index < this.upstreamList.length; index++) {
        if (this.upstreamList[index].value == this.formData.upstream_id) {
          this.selectUpstreamData = this.upstreamList[index].data;
          var _nodes = this.upstreamList[index].data.value.nodes;
          for (const _key in _nodes) {
            var _c = _key.split(":");
            this.selectUpstreamDataColumnsData.push({
              ip: _c[0],
              port: _c[1],
              weights: _nodes[_key]
            });
          }
          console.log(
            this.upstreamList[index].data.value.nodes,
            this.showSelectUpstreamDataColumns
          );
          // this.showSelectUpstreamDataColumns=this.upstreamList[index].nodes;
        }
      }
    }
  },
  mounted() {
    this.init();
  },
  watch: {
    upstream_id(value, _old_value) {
      if (value == "__NEW_UPSTREAM__") {
        this.formData.upstream_id = undefined;
        this.upstreamDialogStatus = true;
      } else {
        this.formData.upstream_id = value;
      }
    }
  }
};
</script>

<style>
</style>
