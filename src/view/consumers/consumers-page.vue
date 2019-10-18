<template>
  <div>
    <Modal :mask-closable="false" v-model="addConsumerDialogStatus" title="添加consumers" @on-ok="submitForm" :loading="true">
      <Form label-position="left" :label-width="100">
        <FormItem label="Desc">
          <Input v-model="formData.desc"></Input>
        </FormItem>
        <FormItem label="Username">
          <Input v-model="formData.username"></Input>
        </FormItem>
        <FormItem label="Plugins">
          <ApisixPlugins :defaultPlugins="plugins" @on-change="updateChangePlugins"></ApisixPlugins>
          </FormItem>
        
      </Form>
    </Modal>
    
    <Card>
      <div style="margin-bottom:10px">
        <Button @click="addConsumerDialogStatus=true">添加consumers</Button>
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
  getConsumersList,
  getConsumerData,
  getPluginsList,
  getPluginConfig,
  addConsumer,
  updateConsumer,
  deleteConsumer
} from "@/api/data";
export default {
  name: "consumers_page",
  components: {
    Tables,
    ApisixPlugins
  },
  data() {
    return {
      plugins:{},
      formData: {
        plugins: {}
      },
      addConsumerDialogStatus: false,
      isEditConsumerStatus: false,
      //获取的所有上游列表
      upstreamList: [],
      columns: [
        { title: "username", key: "username", sortable: true },
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
                          params.tableData[params.index].username +
                          " ?</p>",
                        loading: true,
                        onOk: () => {
                          deleteConsumer(params.tableData[params.index].username)
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
    updateChangePlugins(data){
      this.formData.plugins=data;
    },
    /**
     * 提交路由保存
     */
    submitForm() {
      //update
      if (this.isEditConsumerStatus) {
        updateConsumer(this.formData)
          .then((res, t) => {
            this.addConsumerDialogStatus = false;
            this.isEditConsumerStatus = false;
            this.init();
          })
          .catch((e, res) => {
            this.$Modal.remove();
            this.$Notice.error({
              title: "操作失败",
              desc: e.response.data.error_msg
            });
          });

        return;
      }

      //add
      addConsumer(this.formData)
        .then((res, t) => {
          this.addConsumerDialogStatus = false;
          this.init();
        })
        .catch((e, res) => {
          this.$Modal.remove();
          this.$Notice.error({
            title: "操作失败",
            desc: e.response.data.error_msg
          });
        });
    },

    edit(routeData) {
      //upstream进入编辑模式
      this.isEditConsumerStatus = true;
      this.addConsumerDialogStatus = true;
      getConsumerData(routeData.username).then(res => {
        this.formData = res.data.node.value;
        this.plugins=this.formData.plugins;
      });
    },
    
    init() {
      this.pluginsList = [];

      getPluginsList().then(res => {
        for (var i = 0; i < res.data.length; i++) {
          this.pluginsList.push({
            value: res.data[i],
            label: res.data[i]
          });
        }
      });
      getConsumersList().then(res => {
        this.tableData = [];
        var _data = {};
        for (var i = 0; i < res.data.node.nodes.length; i++) {
          _data = {
            desc: "",
            plugins: "",
            username:""
          };

          if (res.data.node.nodes[i].value.desc) {
            _data.desc = res.data.node.nodes[i].value.desc;
          }
           if (res.data.node.nodes[i].value.username) {
            _data.username = res.data.node.nodes[i].value.username;
          }
          if (res.data.node.nodes[i].value.plugins) {
            for (const key in res.data.node.nodes[i].value.plugins) {
              _data.plugins += key + " ";
            }
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
