<template>
  <div>
    <Select @on-change="pluginChangeSelected" clearable>
      <Option v-for="(item,index)  in pluginsList" :value="item.value" :key="index">{{ item.label }}</Option>
    </Select>

    <Modal :mask-closable="false" v-model="pluginsDialog" title="插件配置">
      <Form
        label-position="left"
        ref="settingPlugins"
        :model="selectPluginField"
        :label-width="180"
      >
        <div v-for="(item,index) in schema.properties" :key="index">
          <FormItem
            :prop="index"
            :label="createLabel(index,item)"
            :rules="{required: isRequired(index),message: 'The '+index+' cannot be empty',type:item.type}"
            v-if="item.type=='integer' || item.type=='number'"
          >
            <InputNumber
              :min="item.minimum || -99999999999"
              :max="item.maximum || 99999999999"
              v-model="selectPluginField[index]"
              @on-change="pluginDataChange(item,index,$event)"
            ></InputNumber>
          </FormItem>
          <FormItem
            :prop="index"
            :rules="{required: isRequired(index),message: 'The '+index+' cannot be empty',type:'string'}"
            :label="createLabel(index,item)"
            v-if="item.type=='string' && !item.enum"
          >
            <Input
              v-model="selectPluginField[index]"
              type="text"
              @on-change="pluginDataChange(item,index,$event)"
            ></Input>
          </FormItem>
          <FormItem
            :prop="index"
            :label="createLabel(index,item)"
            :rules="{required: isRequired(index),message: 'The '+index+' cannot be empty'}"
            v-if="item.type=='string' && item.enum"
          >
            <Select
              v-model="selectPluginField[index]"
              clearable
              @on-change="pluginDataChange(item,index,$event)"
            >
              <Option v-for="item2  in item.enum" :value="item2" :key="item2">{{ item2 }}</Option>
            </Select>
          </FormItem>
        </div>
      </Form>
      <div slot="footer">
        <Button type="text" size="large" @click="pluginsDialog=false">取消</Button>
        <Button type="primary" size="large" @click="savePluginData">确定</Button>
      </div>
    </Modal>

    <div
      v-for="(item,index)  in addPluginsList"
      :value="item.value"
      :key="index"
      style="padding-top:5px"
    >
      <ButtonGroup>
        <Button style="width:150px" @click="setPlugingConfig(item.value)">{{ item.value }}</Button>
        <Button icon="md-close" type="warning" @click="removePlugin(index)"></Button>
      </ButtonGroup>
    </div>
  </div>
</template>

<script>
import Tables from "_c/tables";
import { Form } from "iview";
import { getPluginsList, getPluginConfig } from "@/api/data";
export default {
  name: "apisixPlugins",
  components: {
    Tables
  },
  props: {
    defaultPlugins: Object
  },
  data() {
    return {
      formData: {
        plugins: {}
      },
      //插件配置窗口状态
      pluginsDialog: false,
      //获取的所有插件列表
      pluginsList: [],
      //动态增加的插件列表
      addPluginsList: [],
      //当前选中配置的插件名称
      selectPluginName: "",
      //当前选中配置的插件相关字段数据
      selectPluginField: {},
      //插件配置清单
      schema: {}
    };
  },
  methods: {
    createLabel(index, item) {
      switch (item.type) {
        case "integer":
        case "number":
          if (item.minimum && item.minimum > 0) {
            this.selectPluginField[index] = item.minimum;
          } else {
            this.selectPluginField[index] = 0;
          }
          break;
      }
      return this.schema.required && this.schema.required.indexOf(index) > -1
        ? "*" + index
        : index;
    },
    isRequired(index) {
      return this.schema.required && this.schema.required.indexOf(index) > -1
        ? true
        : false;
    },
    /**
     * 插件配置数据保存
     */
    savePluginData(u) {
      this.$refs["settingPlugins"].validate(valid => {
        if (!valid) {
          return;
        }
        this.pluginsDialog = false;
        this.formData.plugins[this.selectPluginName] = this.selectPluginField;
        for (let index = 0; index < this.addPluginsList.length; index++) {
          if (this.addPluginsList[index].value == this.selectPluginName) {
            return;
          }
        }
        this.addPluginsList.push({
          value: this.selectPluginName
        });

        this.selectPluginField = {};
        this.$emit("on-change", this.formData.plugins);
      });
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
      // console.log(this.selectPluginField);
    },
    pluginChangeSelected(data) {
      this.setPlugingConfig(data);
    },
    removePlugin(index) {
      delete this.formData.plugins[this.addPluginsList[index].value];
      this.addPluginsList.splice(index, 1);
      this.$emit("on-change", this.formData.plugins);
    },
    //获取插件配置数据，并显示插件配置窗口
    setPlugingConfig(plugin) {
      getPluginConfig(plugin).then(res => {
        this.schema = res.data;
        this.selectPluginName = plugin;
        this.pluginsDialog = true;
        if (this.formData.plugins[this.selectPluginName]) {
          this.selectPluginField = this.formData.plugins[this.selectPluginName];
        }
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
    }
  },
  watch: {
    defaultPlugins(plugins) {
      this.addPluginsList = [];
      this.formData.plugins = plugins;
      for (const key in plugins) {
        this.addPluginsList.push({
          value: key
        });
      }
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style>
</style>
