<template>
  <div>

    <ApisixUpstream @on-status="upstreamDialogStatusChange" :editId="editUpstreamId" :status="upstreamDialogStatus"></ApisixUpstream>
    <Card>
      <div style="margin-bottom:10px">
        <Button @click="upstreamDialogStatus=true">添加upstream</Button>
      </div>
      <tables ref="tables" v-model="tableData" :columns="columns" :border="true" />
    </Card>

  </div>
</template>

<script>
import Tables from '_c/tables'
import { Form } from 'iview'
import ApisixUpstream from '_c/apisixUpstream'
import {
  getUpstreamsData,
  getUpstreamsList,
  addUpstream,
  deleteUpstream,
  updateUpstream
} from '@/api/data'
export default {
  name: 'upstream_page',
  components: {
    Tables,
    ApisixUpstream
  },
  data () {
    return {
      upstreamDialogStatus: false,
      editUpstreamId: '',
      upstreamTypeList: [
        {
          value: 'roundrobin',
          label: 'roundrobin'
        },
        {
          value: 'chash',
          label: 'chash'
        }
      ],
      addUpstreamDialogStatus: false,
      isEditUpstreamStatus: false,

      upstreamList: [],

      columns: [
        { title: 'id', key: 'id', sortable: true },
        { title: 'desc', key: 'desc' },
        { title: 'type', key: 'type' },
        {
          title: 'nodes',
          key: 'nodes',
          type: 'html'
        },
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
                          params.tableData[params.index].id +
                          ' ?</p>',
                        loading: true,
                        onOk: () => {
                          deleteUpstream(params.tableData[params.index].id)
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
    upstreamDialogStatusChange (status) {
      this.upstreamDialogStatus = status
    },
    init () {
      getUpstreamsList().then(res => {
        this.tableData = []
        var _data = {}
        for (var i = 0; i < res.data.node.nodes.length; i++) {
          _data = {
            id: res.data.node.nodes[i].key.match(/\/([0-9]+)/)[1],
            desc: '',
            type: '',
            nodes: ''
          }

          if (res.data.node.nodes[i].value.desc) {
            _data.desc = res.data.node.nodes[i].value.desc
          }
          for (const key in res.data.node.nodes[i].value.nodes) {
            // _data.nodes.push({
            //   key: key,
            //   weight: res.data.node.nodes[i].value.nodes[key]
            // })
            _data.nodes +=
              key + ' ' + res.data.node.nodes[i].value.nodes[key] + '<br>'
          }
          this.tableData.push(_data)
        }
        // this.tableData
      })
    },
    edit (data) {
      this.editUpstreamId = data.id
      this.upstreamDialogStatus = true
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style>
</style>
