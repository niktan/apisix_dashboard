<template>
  <div>
    <Modal :mask-closable="false" v-model="addServiceDialogStatus" title="添加services">
      <Form ref="formDialog" :model="formData" label-position="left" :label-width="100">
        <FormItem
          label="Desc"
          prop="desc"
          :rules="{required: true,message: 'The desc cannot be empty'}"
        >
          <Input v-model="formData.desc"></Input>
        </FormItem>
        <FormItem
          label="Upstream"
          prop="upstream_id"
          :rules="{required: true,message: 'The upstream cannot be empty'}"
        >
          <Select clearable v-model="formData.upstream_id">
            <Option
              v-for="(item,index) in upstreamList"
              :value="item.value"
              :key="index"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>

        <FormItem label="Plugin">
          <ApisixPlugins :defaultPlugins="plugins" @on-change="updateChangePlugins"></ApisixPlugins>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="addServiceDialogStatus=false">取消</Button>
        <Button type="primary" size="large" :loading="submitStatus" @click="submitForm">确定</Button>
      </div>
    </Modal>

    <Card>
      <div style="margin-bottom:10px">
        <Button @click="addServiceDialogStatus=true">添加services</Button>
      </div>
      <tables ref="tables" v-model="tableData" :columns="columns" :border="true" />
    </Card>
  </div>
</template>

<script>
import Tables from "_c/tables";
import { Form } from "iview";
import ApisixPlugins from "_c/apisixPlugins";
import {
  getUpstreamsData,
  getServicesList,
  getServicesData,
  getUpstreamsList,
  getPluginsList,
  getPluginConfig,
  addService,
  updateService,
  deleteService
} from "@/api/data";
export default {
  name: "services_page",
  components: {
    Tables,
    ApisixPlugins
  },
  data() {
    return {
      submitStatus: false,
      plugins: {},
      upstreamNodeList: [
        {
          ip: "",
          port: "",
          weights: 1
        }
      ],
      formData: {
        plugins: {}
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
      addServiceDialogStatus: false,
      isEditServiceStatus: false,
      //插件配置窗口状态
      pluginsDialog: false,
      //获取的所有上游列表
      upstreamList: [],

      columns: [
        { title: "id", key: "id", sortable: true },
        { title: "desc", key: "desc" },
        {
          title: "plugins",
          key: "plugins",
          type: "html"
        },
        {
          title: "操作",
          key: "handle",
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
                          "<p>确认删除 " +
                          params.tableData[params.index].desc +
                          " " +
                          params.tableData[params.index].id +
                          " ?</p>",
                        loading: true,
                        onOk: () => {
                          deleteService(params.tableData[params.index].id)
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
    updateChangePlugins(data) {
      this.formData.plugins = data;
    },
    /**
     * 提交保存
     */
    submitForm() {
      this.$refs["formDialog"].validate(valid => {
        if (!valid) {
          return;
        }

        this.submitStatus = true;

        //update
        if (this.isEditServiceStatus) {
          let key = this.formData.key.match(/\/([0-9]+)/)[1];
          delete this.formData.key;
          updateService(key, this.formData)
            .then((res, t) => {
              this.addServiceDialogStatus = false;
              this.isEditServiceStatus = false;
              this.submitStatus = false;
              this.formData = {plugins:{}};
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

        //add
        addService(this.formData)
          .then((res, t) => {
            this.addServiceDialogStatus = false;
            this.isEditServiceStatus = false;
            this.submitStatus = false;
             this.formData = {plugins:{}};
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

    edit(routeData) {
      //upstream进入编辑模式
      this.isEditServiceStatus = true;
      this.addServiceDialogStatus = true;
      getServicesData(routeData.id).then(res => {
        this.formData = res.data.node.value;
        this.formData.key = res.data.node.key;
        this.plugins = this.formData.plugins;
      });
    },
    /**
     * 插件配置数据保存
     */
    savePluginData() {
      this.formData.plugins[this.selectPluginName] = this.selectPluginField;
      this.selectPluginField = {};
    },
    /**
     * 插件配置数据变化处理
     */
    pluginDataChange(item, key, value) {
      // console.log('....',this.selectPluginField);
      // if(!this.formData.plugins[this.selectPluginName]){
      //   this.formData.plugins[this.selectPluginName]={};
      // }
      // //this.formData.plugins[this.selectPluginName][key]=value;
      // console.log(this.formData);
    },
    pluginChangeSelected(data) {
      for (let index = 0; index < this.addPluginsList.length; index++) {
        if (this.addPluginsList[index].value == data) {
          return;
        }
      }
      this.addPluginsList.push({
        value: data
      });
    },
    removePlugin(index) {
      this.addPluginsList.splice(index, 1);
    },
    //获取插件配置数据，并显示插件配置窗口
    setPlugingConfig(plugin) {
      getPluginConfig(plugin).then(res => {
        console.log(res);
        this.schema = res.data;
        this.selectPluginName = plugin;
        this.pluginsDialog = true;
        if (this.formData.plugins[this.selectPluginName]) {
          this.selectPluginField = this.formData.plugins[this.selectPluginName];
        }
      });
    },
    init() {
      this.upstreamList = [];
      this.pluginsList = [];
      getUpstreamsList().then(res => {
        var _data = [];
        for (var i = 0; i < res.data.node.nodes.length; i++) {
          this.upstreamList.push({
            value: res.data.node.nodes[i].key.match(/\/([0-9]+)/)[1],
            label: res.data.node.nodes[i].value.desc
          });
        }
      });
      getPluginsList().then(res => {
        for (var i = 0; i < res.data.length; i++) {
          this.pluginsList.push({
            value: res.data[i],
            label: res.data[i]
          });
        }
      });
      getServicesList().then(res => {
        this.tableData = [];
        var _data = {};
        for (var i = 0; i < res.data.node.nodes.length; i++) {
          _data = {
            id: res.data.node.nodes[i].key.match(/\/([0-9]+)/)[1],
            desc: "",
            plugins: ""
          };

          if (res.data.node.nodes[i].value.desc) {
            _data.desc = res.data.node.nodes[i].value.desc;
          }
          if (res.data.node.nodes[i].value.plugins) {
            for (const key in res.data.node.nodes[i].value.plugins) {
              _data.plugins += key + " ";
            }
          }
          for (const key in res.data.node.nodes[i].value.nodes) {
            // _data.nodes.push({
            //   key: key,
            //   weight: res.data.node.nodes[i].value.nodes[key]
            // })
            _data.nodes +=
              key + " " + res.data.node.nodes[i].value.nodes[key] + "<br>";
          }
          this.tableData.push(_data);
        }
        //this.tableData
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style>
</style>
