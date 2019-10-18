<template>
  <div>

    <Modal  :mask-closable="false" v-model="addSslDialogStatus" title="添加SSL">
      <Form ref="formDialog" label-position="left" :model="formData" :label-width="100">
        <FormItem
          label="*Sni"
          prop="sni"
          :rules="{required: true,message: 'The sni cannot be empty'}"
        >
          <Input v-model="formData.sni"></Input>
        </FormItem>
        <FormItem
          label="*Key"
          prop="key"
          :rules="{required: true,message: 'The key cannot be empty'}"
        >
          <Input v-model="formData.key" type="textarea" :autosize="{minRows: 6,maxRows: 20}"></Input>
        </FormItem>
        <FormItem
          label="*Cert"
          prop="cert"
          :rules="{required: true,message: 'The cert cannot be empty'}"
        >
          <Input v-model="formData.cert" type="textarea" :autosize="{minRows: 6,maxRows: 20}"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" size="large"  @click="addSslDialogStatus=false">取消</Button>
        <Button type="primary" size="large" :loading="submitStatus" @click="submitForm">确定</Button>
      </div>
    </Modal>

    <Card>
      <div style="margin-bottom:10px">
        <Button @click="addSslDialogStatus=true">添加SSL</Button>
      </div>
      <tables ref="tables" v-model="tableData" :columns="columns" :border="true" />
    </Card>
  </div>
</template>

<script>
import Tables from '_c/tables'
import { Form } from 'iview'
import { getSslsList, getSslData, updateSsl, deleteSsl, addSsl } from '@/api/data'
export default {
  name: 'ssl_page',
  components: {
    Tables
  },
  data () {
    return {
      plugins: {},
      formData: {
      },
      addSslDialogStatus: false,
      isEditSslStatus: false,
      submitStatus: false,
      editSslId: null,
      columns: [
        { title: 'id', key: 'id', sortable: true },
        { title: 'sni', key: 'sni' },
        {
          title: '操作',
          key: 'handle',
          button: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.edit(params.tableData[params.index])
                    }
                  }
                },
                '编辑'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.$Modal.confirm({
                        title: '确认删除',
                        content:
                          '<p>确认删除 ' +
                          params.tableData[params.index].desc +
                          ' ' +
                          params.tableData[params.index].username +
                          ' ?</p>',
                        loading: true,
                        onOk: () => {
                          deleteSsl(params.tableData[params.index].username)
                            .then(res => {
                              this.$Modal.remove()
                              this.$Message.success('Has Deleted!')
                              this.init()
                            })
                            .catch((e, res) => {
                              this.$Modal.remove()
                              this.$Notice.error({
                                title: '操作失败',
                                desc: e.response.data.error_msg
                              })
                            })
                        }
                      })
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
      tableData: []
    }
  },
  methods: {
    /**
     * 提交路由保存
     */
    submitForm () {
      this.$refs['formDialog'].validate(valid => {
        if (!valid) {
          return
        }

        this.submitStatus = true
        // update
        if (this.isEditSslStatus) {
          let key = this.editSslId.match(/\/([0-9]+)/)[1]
          updateSsl(key, this.formData)
            .then((res, t) => {
              this.addSslDialogStatus = false
              this.isEditSslStatus = false
              this.submitStatus = false
              this.formData = {}
              this.init()
            })
            .catch((e, res) => {
              this.submitStatus = false
              this.$Notice.error({
                title: '操作失败',
                desc: e.response.data.error_msg
              })
            })
          return
        }
        // add
        addSsl(this.formData)
          .then((res, t) => {
            this.addSslDialogStatus = false
            this.isEditSslStatus = false
            this.submitStatus = false
            this.formData = {}
            this.init()
          })
          .catch((e, res) => {
            this.submitStatus = false
            this.$Notice.error({
              title: '操作失败',
              desc: e.response.data.error_msg
            })
          })
      })
    },

    edit (routeData) {
      // upstream进入编辑模式
      this.isEditSslStatus = true
      this.addSslDialogStatus = true
      getSslData(routeData.id).then(res => {
        this.formData = res.data.node.value
        this.editSslId = res.data.node.key
      })
    },

    init () {
      getSslsList().then(res => {
        this.tableData = []
        var _data = {}
        for (var i = 0; i < res.data.node.nodes.length; i++) {
          _data = {
            id: res.data.node.nodes[i].key.match(/\/([0-9]+)/)[1],
            sni: res.data.node.nodes[i].value.sni
          }
          this.tableData.push(_data)
        }
        // this.tableData
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style>
.demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
</style>
