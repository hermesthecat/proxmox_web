<template>
  <Dialog :visible="visible" @close="close()" @confirm="confirm" @cancel="cancel" cancelText="Reset" :_style="{
    width: '100%',
    height: 'calc(100%)',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    'overflow-y': 'clip',
  }" title="Create Virtual Machine">
    <template slot="content">
      <div>
        <!--Step indicator-->
        <m-steps :active="step" @change="handleStepChange">
          <m-step title="General"></m-step>
          <m-step title="Template"></m-step>
          <m-step title="Root Disk"></m-step>
          <m-step title="CPU">CPU</m-step>
          <m-step title="Memory">Memory</m-step>
          <m-step title="Network">Network</m-step>
          <m-step title="DNS">DNS</m-step>
          <m-step title="Confirm">Confirm</m-step>
        </m-steps>
      </div>
      <!--Step 1: Add name, vmid etc-->
      <div v-show="step === 1" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <!--Input component validateEvent indicates validation is required, show-error indicates whether validation passed; error-msg shows validation failure message; validate for validation; v-modal for input value-->
              <m-input v-model="hostname" prop="hostname" label="Hostname" labelWidth="100px" validateEvent
                :show-error="rules['hostname'].error" :error-msg="rules['hostname'].message" @validate="validate"
                placeholder="Please enter name" />
              <m-input v-model="vmid" type="number" prop="vmid" label="CT ID" labelWidth="100px" validateEvent required
                :show-error="rules['vmid'].error" :error-msg="rules['vmid'].message" @validate="validate"
                placeholder="Please enter ID" />

              <m-select prop="nodename" label="Node" labelWidth="100px" validateEvent @validate="validate"
                :show-error="rules.nodename.error" :error-msg="rules.nodename.message" :readonly="false" required
                @on-change="(value) => (nodename = value)" v-model="nodename" placeholder="Please select node">
                <m-option v-for="(item, index) in nodeList" :key="item.node" :label="item.node" :value="item.node">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Node</div>
                    <div class="table-td">Memory Usage</div>
                    <div class="table-td">CPU Usage</div>
                  </div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.node">{{
                      item.node
                    }}</span>
                    <span class="table-td" :title="item.mem &&
                      item.maxmem &&
                      percentToFixed(item.mem / item.maxmem, 3)
                      ">{{
                        item.mem &&
                        item.maxmem &&
                        percentToFixed(item.mem / item.maxmem, 3)
                      }}</span>
                    <span class="table-td" :title="item.cpu &&
                      item.maxcpu &&
                      `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`
                      ">{{
                        item.cpu &&
                        item.maxcpu &&
                        `${percentToFixed(item.cpu, 3)} of ${item.maxcpu}`
                      }}</span>
                  </div>
                </m-option>
              </m-select>

              <m-select prop="pool" label="Resource Pool" labelWidth="100px" validateEvent @validate="validate"
                :show-error="rules.pool.error" :error-msg="rules.pool.message" :readonly="false"
                @on-change="(value) => (pool = value)" v-model="pool" placeholder="Please select node">
                <m-option v-for="(item, index) in poolList" :key="item.poolid" :label="item.poolid"
                  :value="item.poolid">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Pool</div>
                    <div class="table-td">Description</div>
                  </div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.poolid">{{
                      item.poolid
                    }}</span>
                    <span class="table-td" :title="item.comment">{{
                      item.comment
                    }}</span>
                  </div>
                </m-option>
              </m-select>

              <m-input v-model="password" type="password" prop="password" label="Password" labelWidth="100px"
                validateEvent :show-error="rules['password'].error" :error-msg="rules['password'].message"
                @validate="validate" placeholder="Please enter password" />

              <m-input v-model="vPsw" type="password" prop="vPsw" label="Confirm Password" labelWidth="100px"
                validateEvent :show-error="rules['vPsw'].error" :error-msg="rules['vPsw'].message" @validate="validate"
                placeholder="Please confirm password" />

              <m-input v-model="ssh" type="text" prop="ssh" label="SSH Public Key" labelWidth="100px" validateEvent
                :show-error="rules['ssh'].error" :error-msg="rules['ssh'].message" @validate="validate"
                placeholder="Please enter SSH public key" />
              <m-button type="primary" style="position: relative">
                <input type="file" ref="uploadFile" @change="uploadSsh" class="upload-input" />
                Load SSH Key File
              </m-button>

              <m-checkbox v-model="unprivileged" label="Unprivileged Container" labelWidth="100px"></m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
      <!--Step 2: Image selection method-->
      <div v-if="step === 2" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dd>
              <m-select prop="storage" label="Storage" labelWidth="100px" validateEvent @validate="validate" required
                :show-error="rules.storage.error" :error-msg="rules.storage.message" :readonly="false"
                @on-change="handleStorageSelect" v-model="storage" placeholder="Please select node">
                <m-option v-for="(item, index) in storageList" :key="item.storage" :label="item.storage"
                  :value="item.storage">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Name</div>
                    <div class="table-td">Type</div>
                    <div class="table-td">Available</div>
                    <div class="table-td">Capacity</div>
                  </div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.storage">{{
                      item.storage
                    }}</span>
                    <span class="table-td" :title="item.type">{{
                      item.type
                    }}</span>
                    <span class="table-td" :title="byteToSize(item.avail)">{{
                      byteToSize(item.avail)
                    }}</span>
                    <span class="table-td" :title="byteToSize(item.total)">{{
                      byteToSize(item.total)
                    }}</span>
                  </div>
                </m-option>
              </m-select>

              <m-select prop="tmpl" label="Template" labelWidth="100px" validateEvent @validate="validate"
                :show-error="rules.tmpl.error" :error-msg="rules.tmpl.message" required :readonly="false"
                @on-change="(value) => (tmpl = value)" v-model="tmpl" placeholder="Please select disk image">
                <m-option v-for="(item, index) in isoList" :key="item.volid &&
                  item.volid.replace(/([\s\S]*)\/([\s\S]*)$/, '$2')
                  " :label="item.volid &&
                    item.volid.replace(/([\s\S]*)\/([\s\S]*)$/, '$2')
                    " :value="item.volid &&
                    item.volid.replace(/([\s\S]*)\/([\s\S]*)$/, '$2')
                    ">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Name</div>
                    <div class="table-td">Format</div>
                    <div class="table-td">Size</div>
                  </div>
                  <div class="table-tr">
                    <span class="table-td" :title="item.volid &&
                      item.volid.replace(/([\s\S]*)\/([\s\S]*)$/, '$2')
                      ">{{
                        item.volid &&
                        item.volid.replace(/([\s\S]*)\/([\s\S]*)$/, "$2")
                      }}</span>
                    <span class="table-td" :title="item.format">{{
                      item.format
                    }}</span>
                    <span class="table-td" :title="byteToSize(item.size)">{{
                      byteToSize(item.size)
                    }}</span>
                  </div>
                </m-option>
              </m-select>
            </dd>
          </dl>
        </div>
      </div>
      <!--Configure GPU-->
      <div v-if="step === 3" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>GPU</dt>
            <dd>
              <m-select prop="rootStorage" label="Storage" labelWidth="100px"
                @on-change="(value) => (rootStorage = value)" v-model="rootStorage" validateEvent @validate="validate"
                :error-msg="rules['rootStorage'].message" :show-error="rules['rootStorage'].error" required
                :readonly="false" placeholder="Please select storage">
                <div class="table">
                  <m-option v-for="(item, index) in rootStorageList" :key="item.storage" :value="item.storage"
                    :label="item.storage">
                    <div v-if="index === 0" class="table-tr">
                      <div class="table-td">Name</div>
                      <div class="table-td">Type</div>
                      <div class="table-td">Available</div>
                      <div class="table-td">Capacity</div>
                    </div>
                    <div class="table-tr">
                      <div class="table-td" :title="item.storage">
                        {{ item.storage }}
                      </div>
                      <div class="table-td" :title="item.type">
                        {{ item.type }}
                      </div>
                      <div class="table-td" :title="byteToSize(item.avail)">
                        {{ byteToSize(item.avail) }}
                      </div>
                      <div class="table-td" :title="byteToSize(item.total)">
                        {{ byteToSize(item.total) }}
                      </div>
                    </div>
                  </m-option>
                </div>
              </m-select>
              <m-input type="number" labelWidth="100px" label="Disk Size (GiB)" v-model="size" :max="131072"
                validateEvent @validate="validate" prop="size" :min="1" required :error-msg="rules['size'].message"
                :show-error="rules['size'].error" />
            </dd>
          </dl>
        </div>
        <div class="m-form__section" v-if="isAdvice">
          <dl>
            <dt>Advanced</dt>
            <dd>
              <m-checkbox v-model="quota" label="Enable Quota" :disabled="!isQuota()" labelWidth="100px" />
              <m-select v-model="acl" prop="acl" @on-change="(value) => (acl = value)"
                placeholder="Please enter disk image" label="ACLs" labelWidth="100px">
                <m-option v-for="item in aclsItems" :key="item.value" :value="item.value"
                  :label="item.label"></m-option>
              </m-select>
              <m-checkbox v-model="replicate" label="Skip Replication" labelWidth="100px" />
              <m-select v-model="mountoptions" type="multiple" prop="mountoptions"
                @on-change="(value) => (mountoptions = value)" placeholder="Select mount options" label="Mount Options"
                labelWidth="100px">
                <m-option v-for="item in munteoptionsItems" :key="item.value" :label="item.label" :value="item.value">
                </m-option>
              </m-select>
            </dd>
          </dl>
        </div>
      </div>
      <!--Configure drivers-->
      <div v-if="step === 4" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>CPU</dt>
            <dd>
              <m-input type="number" v-model="cores" prop="cores" :min="0" validateEvent @validate="validate" required
                :show-error="rules['cores'].error" :error-msg="rules['cores'].message"
                placeholder="Please enter number of cores" label="Cores" labelWidth="100px" />
            </dd>
          </dl>
        </div>

        <div class="m-margin-top-10 m-form__section" v-if="isAdvice">
          <dt>Advanced</dt>
          <dd>
            <m-input type="number" v-model="cpulimit" prop="cpulimit" :min="0" validateEvent @validate="validate"
              required :show-error="rules['cpulimit'].error" :error-msg="rules['cpulimit'].message"
              placeholder="Please enter CPU limit" label="CPU Limit" labelWidth="100px" />
            <m-input type="number" v-model="cpuunits" prop="cpuunits" :min="8" validateEvent @validate="validate"
              required :show-error="rules['cpuunits'].error" :error-msg="rules['cpuunits'].message"
              placeholder="Please enter CPU weight" label="CPU Weight" labelWidth="100px" />
          </dd>
        </div>
      </div>

      <!--Configure CPU and other information-->
      <div v-if="step === 5" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>Basic Information</dt>
            <dd>
              <m-input type="number" v-model="memory" prop="memory" validateEvent :min="16" @validate="validate"
                required :show-error="rules['memory'].error" :error-msg="rules['memory'].message"
                placeholder="Please enter memory" label="Memory (MiB)" labelWidth="100px" />
              <m-input type="number" v-model="swap" prop="swap" validateEvent @validate="validate" :min="0" required
                :show-error="rules['swap'].error" :error-msg="rules['swap'].message" placeholder="Please enter swap"
                label="Swap (MiB)" labelWidth="100px" />
            </dd>
          </dl>
        </div>
      </div>

      <!--Configure memory-->
      <div v-if="step === 6" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>Basic Information</dt>
            <dd>
              <m-input v-model="name" prop="name" label="Name" labelWidth="100px" validateEvent @validate="validate"
                placeholder="Format: eth0" required :show-error="rules['name'].error"
                :error-msg="rules['name'].message" />

              <m-input v-model="hwaddr" prop="hwaddr" label="MAC Address" labelWidth="100px" validateEvent
                @validate="validate" placeholder="Format: 2A:75:78:42:45:37" :show-error="rules['hwaddr'].error"
                :error-msg="rules['hwaddr'].message" />

              <m-select v-model="bridge" prop="bridge" label="Bridge" labelWidth="100px" validateEvent
                @validate="validate" required :show-error="rules['bridge'].error" :error-msg="rules['bridge'].message"
                @on-change="(value) => (bridge = value)">
                <m-option v-for="(item, index) in networkList" :key="item.iface" :label="item.iface"
                  :value="item.iface">
                  <div v-if="index === 0" class="table-tr">
                    <div class="table-td">Bridge</div>
                    <div class="table-td">Active</div>
                    <div class="table-td">Comment</div>
                  </div>
                  <div class="table-tr">
                    <div class="table-td" :title="item.iface">
                      {{ item.iface }}
                    </div>
                    <div class="table-td" :title="item.active">
                      <table-info-state :content="item.active && item.active === 1 ? 'Yes' : 'No'
                        " :state="item.active && item.active === 1
                            ? 'actived'
                            : 'unActived'
                          "></table-info-state>
                    </div>
                    <div class="table-td" :title="item.comment">
                      {{ item.comment }}
                    </div>
                  </div>
                </m-option>
              </m-select>

              <m-input v-model="tag" prop="tag" type="number" label="VLAN Tag" labelWidth="100px"
                placeholder="Please enter VLAN tag" />

              <m-input v-model="rate" type="number" prop="rate" label="Rate Limit (MiB)" labelWidth="100px" :min="0"
                placeholder="Please enter rate limit" />

              <m-checkbox v-model="firewall" prop="firewall" label="Firewall" labelWidth="100px" />
            </dd>
          </dl>
          <dl>
            <dt>IPV4</dt>
            <dd>
              <div>
                <label class="m-input__radio">
                  <input type="radio" value="static" name="ipv4" v-model="ip4type" />
                  <div></div>
                  <span>Static</span>
                </label>
                <label class="m-input__radio">
                  <input type="radio" value="dhcp" name="ipv4" v-model="ip4type" @change="() => {
                      ip = '';
                      gw = '';
                    }
                    " />
                  <div></div>
                  <span>DHCP</span>
                </label>
              </div>
              <m-input v-model="ip" prop="ip" label="IPv4/CIDR" labelWidth="100px" validateEvent @validate="validate"
                :show-error="rules['ip'].error" :error-msg="rules['ip'].message" :disabled="ip4type !== 'static'"
                placeholder="None" />

              <m-input v-model="gw" prop="gw" label="Gateway (IPv4)" labelWidth="100px" validateEvent
                @validate="validate" placeholder="Format: 10.10.10.0" :show-error="rules['gw'].error"
                :disabled="ip4type !== 'static'" :error-msg="rules['gw'].message" />
            </dd>
          </dl>

          <dl>
            <dt>IPV6</dt>
            <dd>
              <div>
                <label class="m-input__radio">
                  <input type="radio" value="static" name="ipv6" v-model="ip6type" />
                  <div></div>
                  <span>Static</span>
                </label>
                <label class="m-input__radio">
                  <input type="radio" value="dhcp" name="ipv6" v-model="ip6type" @change="() => {
                      ip6 = '';
                      gw6 = '';
                    }
                    " />
                  <div></div>
                  <span>DHCP</span>
                </label>
                <label class="m-input__radio">
                  <input type="radio" value="auto" name="ipv6" v-model="ip6type" @change="() => {
                      ip6 = '';
                      gw6 = '';
                    }
                    " />
                  <div></div>
                  <span>SLAAC</span>
                </label>
              </div>
              <m-input v-model="ip6" prop="ip6" label="IPv6/CIDR" labelWidth="100px" validateEvent @validate="validate"
                :show-error="rules['ip6'].error" :error-msg="rules['ip6'].message" :disabled="ip6type !== 'static'"
                placeholder="None" />

              <m-input v-model="gw6" prop="gw6" label="Gateway (IPv6)" labelWidth="100px" validateEvent
                @validate="validate" :show-error="rules['gw6'].error" placeholder="Format: 2001:DB8::42"
                :disabled="ip6type !== 'static'" :error-msg="rules['gw6'].message" />
            </dd>
          </dl>
        </div>
      </div>

      <!--Configure network-->
      <div v-if="step === 7" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>Basic Information</dt>
            <dd>
              <m-input v-model="searchdomain" prop="searchdomain" label="DNS Domain" labelWidth="100px"
                placeholder="Please enter DNS domain" />

              <m-input v-model="nameserver" prop="nameserver" label="DNS Server" labelWidth="100px" validateEvent
                @validate="validate" :show-error="rules['nameserver'].error" placeholder="Format: 192.168.1.1"
                :error-msg="rules['nameserver'].message" />
            </dd>
          </dl>
        </div>
      </div>
      <!--Display configuration parameters-->
      <div v-if="step === 8" class="m-form__content">
        <div class="m-form__section">
          <dl>
            <dt>Preview</dt>
            <dd>
              <div class="table">
                <div class="table-tr">
                  <span class="table-td">key</span>
                  <span class="table-td">value</span>
                </div>
                <div v-for="(data, key) of params" class="table-tr" :key="key">
                  <span class="table-td" :title="key">{{ key }}</span>
                  <span class="table-td" :title="data">{{ data }}</span>
                </div>
              </div>
            </dd>
            <dt>Auto Start</dt>
            <dd>
              <m-checkbox v-model="start">Auto start after creation</m-checkbox>
            </dd>
          </dl>
        </div>
      </div>
    </template>
    <template slot="footer">
      <div class="label_box">
        <label>
          <input type="checkbox" v-model="isAdvice" />
          <div>Advanced</div>
        </label>
      </div>
      <m-button type="primary" style="height: 40px; line-height: 40px; width: 100px"
        @on-click="prev()">Previous</m-button>
      <m-button type="primary" style="height: 40px; line-height: 40px; width: 100px" @on-click="next()"
        v-show="step < 8">Next</m-button>
      <m-button type="primary" style="height: 40px; line-height: 40px; width: 100px" @on-click="confirm()"
        v-show="step === 8">Confirm</m-button>
      <m-dialog :visible="showLog" @close="closeLog" :_style="{
        width: '800px',
      }" title="Task Viewer: Recovery">
        <template slot="content">
          <m-tab v-model="tab" @tab-click="handleTabChange">
            <m-tab-panel label="Output" name="log"></m-tab-panel>
            <m-tab-panel label="Status" name="status"></m-tab-panel>
          </m-tab>
          <m-button class="create-btn m-margin-top-10" type="primary" @on-click="stopTask1"
            :disabled="db.addClusterStatusObj.status !== 'running'">Stop</m-button>
          <el-scrollbar style="height: 100%">
            <div class="taskmodal-content">
              <div class="table" v-if="tab === 'log'">
                <div class="table-tr" v-for="item in db.addClusterLogList" :key="item.n">
                  {{ item.t }}
                </div>
              </div>
              <div class="table" v-if="tab === 'status'">
                <template v-for="(item, key) in db.addClusterStatusObj">
                  <div class="table-tr" v-if="!['exitstatus', 'id', 'pstart'].includes(key)" :key="key">
                    <div class="table-td">{{ $t(`clusterStatus.${key}`) }}</div>
                    <div class="table-td" v-if="key === 'starttime'">
                      {{
                        dateFormat(new Date(item * 1000), "yyyy-MM-dd hh:mm")
                      }}
                    </div>
                    <div class="table-td" v-else>{{ item }}</div>
                  </div>
                </template>
              </div>
            </div>
          </el-scrollbar>
        </template>
        <template slot="footer">
          <span></span>
        </template>
      </m-dialog>
    </template>
  </Dialog>
</template>

<script>
import MSteps from "../step/MSteps";
import MStep from "../step/MStep";
import Button from "../button/Button";
import CreateQemuHttp from "./Http";
import {
  flotToFixed,
  byteToSize,
  getEvent,
  percentToFixed,
  IP6_match,
  IP4_match,
  IP6_cidr_match,
  IP4_cidr_match,
  isEmpty,
  parseSSHKey,
  quickSort,
  dateFormat,
} from "@libs/utils/";
import {
  VGALIST,
  BIOSLIST,
  SCSIHWLIST,
  MACHINELIST,
  DEVICELIST,
  CACHELIST,
  CPULIST,
  MODELLIST,
  VMCPUFlag,
} from "@libs/enum/enum";
import Dialog from "@src/components/dialog/Dialog";
export default {
  name: "CreateLxcModal",
  mixins: [CreateQemuHttp],
  props: {
    visible: Boolean,
  },
  components: {
    MStep,
    MSteps,
    "m-button": Button,
    Dialog,
  },
  data() {
    return {
      interVal: null,
      showLog: false,
      tab: "log",
      name: "",
      hostname: "",
      nameserver: "",
      searchdomain: "",
      ip: "",
      ip6: "",
      gw: "",
      gw6: "",
      vmid: "",
      nodename: "",
      pool: "",
      ssh: "",
      unprivileged: false,
      storage: "",
      rootStorage: "",
      tmpl: "",
      password: "",
      vPsw: "",
      size: 8,
      acl: "",
      quota: "",
      mountoptions: ["noatime"],
      replicate: "",
      cores: "",
      cpulimit: "",
      cpuunits: "",
      firewall: false,
      rate: "",
      tag: "",
      bridge: "",
      hwaddr: "",
      ip4type: "static",
      ip6type: "static",
      step: 1,
      isAdvice: true,
      poolList: [],
      nodeList: [],
      storageList: [],
      rootStorageList: [],
      networkList: [],
      isoList: [],
      memory: "",
      swap: "",
      start: false,
      munteoptionsItems: [
        { label: "noatime", value: "noatime" },
        { label: "nodev", value: "nodev" },
        { label: "noexec", value: "noexec" },
        { label: "nosuid", value: "nosuid" },
      ],
      aclsItems: [
        { value: "__default__", label: "Default" },
        { value: "1", label: "Enabled" },
        { value: "0", label: "Disabled" },
      ],
      params: {},
      rules: {
        storage: {
          error: false,
          message: "",
        },
        tmpl: {
          error: false,
          message: "",
        },
        name: {
          error: false,
          message: "",
        },
        vmid: {
          error: false,
          message: "",
        },
        nodename: {
          error: false,
          message: "",
        },
        swap: {
          error: false,
          message: "",
        },
        ip: {
          error: false,
          message: "",
        },
        ip6: {
          error: false,
          message: "",
        },
        size: {
          error: false,
          message: "",
        },
        vPsw: {
          error: false,
          message: "",
        },
        password: {
          error: false,
          message: "",
        },
        cores: {
          error: false,
          message: "",
        },
        cpuunits: {
          error: false,
          message: "",
        },
        memory: {
          error: false,
          message: "",
        },
        gw: {
          error: false,
          message: "",
        },
        gw6: {
          error: false,
          message: "",
        },
        pool: {
          error: false,
          message: "",
        },
        ssh: {
          error: false,
          message: "",
        },
        hostname: {
          error: false,
          message: "",
        },
        rootStorage: {
          error: false,
          message: "",
        },
        cpulimit: {
          error: false,
          message: "",
        },
        cpuunits: {
          error: false,
          message: "",
        },
        hwaddr: {
          error: false,
          message: "",
        },
        bridge: {
          error: false,
          message: "",
        },
        searchdomain: {
          error: false,
          message: "",
        },
        nameserver: {
          error: false,
          message: "",
        },
      },
    };
  },
  mounted() {
    this.__init__();
  },
  methods: {
    flotToFixed,
    byteToSize,
    percentToFixed,
    dateFormat,
    // Confirm add
    confirm() {
      // Create request
      delete this.params.nodename;
      this.createLxc(
        Object.assign(this.params, {
          start: this.start ? 1 : 0,
          password: this.password,
        })
      )
        .then(() => {
          this.tab = "log";
          this.showLog = true;
          this.interVal = setInterval(() => {
            this.queryLog(this.nodename, this.db.addClusterStatusObj.upid);
            this.queryStatus(this.nodename, this.db.addClusterStatusObj.upid);
          }, 3000);
        })
        .catch((res) => {
          this.$confirm.confirm({
            msg: res,
          });
        });
    },
    // End task
    stopTask1() {
      this.stopTask(
        this.db.addClusterStatusObj.node,
        this.db.addClusterStatusObj.upid
      ).then((res) => {
        if (this.interVal) {
          clearInterval(this.interVal);
          this.interVal = null;
        }
      });
    },
    closeLog() {
      if (this.interVal) {
        clearInterval(this.interVal);
        this.interVal = null;
      }
      this.$emit("close");
    },
    /**
     * Upload SSH
     */
    uploadSsh() {
      let file = this.$refs.uploadFile.files[0],
        rs = new FileReader();
      rs.onload = (e) => {
        if (e.target.readyState === 2) {
          this.ssh = e.target.result;
        }
      };
      rs.readAsText(file);
    },
    cancel() { },
    // Next button operations
    async next() {
      // Validate form for each step
      if (this.validateAll()) return;
      // If validation passes, increment step
      if (this.step < 8) ++this.step;
      if (this.step === 2) {
        // Query storage
        await this.queryStorageList({ format: 1, content: "vztmpl" }).then(
          (res) => {
            this.storage = this.storageList[0].storage;
          }
        );
        // Query template list based on storage and initialize
        this.queryIsoList({ storage: this.storage, content: "vztmpl" }).then(
          (res) => {
            this.tmpl =
              this.isoList.length > 0
                ? this.isoList[0].volid.replace(/([\s\S]*)\/([\s\S]*)$/, "$2")
                : "";
          }
        );
      }
      if (this.step === 3) {
        // Query storage
        this.queryStorageList({ format: 1, content: "rootdir" }).then(
          (data) => {
            this.rootStorageList = data || [];
            this.rootStorage =
              this.rootStorageList.length > 0
                ? this.rootStorageList[0].storage
                : "";
          }
        );
      }
      if (this.step === 6) {
        // Query network and initialize network selection
        Promise.all([this.queryNetWorkList()]).then(() => {
          this.bridge =
            this.networkList.length > 0 ? this.networkList[0].iface : "";
        });
      }
      if (this.step === 8) {
        // Build add request parameters
        // Network
        let network = "";
        if (this.name) network += `name=${this.name},`;
        if (this.bridge) network += `bridge=${this.bridge},`;
        if (this.firewall) network += `firewall=1,`;
        if (this.ip) network += `ip=${this.ip},`;
        if (this.ip6) network += `ip6=${this.ip6},`;
        if (this.gw) network += `gw=${this.gw},`;
        if (this.gw6) network += `gw6=${this.gw6},`;
        if (this.hwaddr) network += `hwaddr=${this.hwaddr},`;
        if (this.rate) network += `rate=${this.rate},`;
        if (this.tag) network += `tag=${this.tag},`;
        if (this.ip4type && this.ip4type !== "static")
          network += `ip=${this.ip4type},`;
        if (this.ip6type && this.ip6type !== "static")
          network += `ip6=${this.ip6type},`;
        // Root disk
        let rootDisk = "";
        rootDisk += `${this.rootStorage}:${this.size},`;
        if (this.isAdvice) {
          if (this.acl && this.acl !== "__default__")
            rootDisk += `acl=${this.acl},`;
          if (this.replicate) rootDisk += `replicate=0,`;
          if (this.mountoptions)
            rootDisk += `mountoptions=${this.mountoptions.join(";")},`;
          if (this.quota) rootDisk += `quota=1,`;
        }
        // OS template
        let tmpl = "";
        tmpl += `${this.storage}:vztmpl/${this.tmpl},`;
        let baseParams = {};
        baseParams = {
          cores: this.cores,
          hostname: this.hostname,
          memory: this.memory,
          nameserver: this.nameserver,
          net0: network.replace(/\,$/, ""),
          nodename: this.nodename,
          ostemplate: tmpl.replace(/\,$/, ""),
          pool: this.pool,
          rootfs: rootDisk.replace(/\,$/, ""),
          searchdomain: this.searchdomain,
          swap: this.swap,
          vmid: this.vmid,
        };
        if (this.isAdvice) {
          baseParams["cpulimit"] = this.cpulimit;
          baseParams["cpuunits"] = this.cpuunits;
        }
        if (!this.unprivileged) {
          baseParams["unprivileged"] = 1;
        }
        Object.keys(baseParams).forEach((key) => {
          if (!baseParams[key]) delete baseParams[key];
        });
        this.params = baseParams;
      }
    },
    // Previous step
    prev() {
      // Decrease step count until 1
      if (this.step > 1) --this.step;
    },
    // Close
    close() {
      this.$emit("close", false);
    },
    // Overall validation
    validateAll() {
      let props = [];
      if (this.step === 1)
        props = ["nodename", "vmid", "password", "vPsw", "ssh", "hostname"];
      if (this.step === 2) props = ["storage", "tmpl"];
      if (this.step === 4) {
        this.isAdvice
          ? (props = ["cpulimit", "cpuunits", "cores"])
          : (props = ["cores"]);
      }
      if (this.step === 5) {
        props = ["memory", "swap"];
      }
      if (this.step === 6) {
        props = ["name", "bridge", "gw", "gw6", "ip", "ip6", "hwaddr"];
      }
      props.forEach((prop) => this.validate(prop));
      return props.some((prop) => this.rules[prop].error === true);
    },
    // Individual validation
    validate(prop) {
      let value = String(this[prop]).trim();
      this.rules[prop].error = false;
      this.rules[prop].message = "";
      if (
        /^\s*$/.test(value) &&
        [
          "vmid",
          "nodename",
          "storage",
          "tmpl",
          "size",
          "memory",
          "swap",
          "name",
          "rootStorage",
        ].includes(prop)
      ) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Cannot be empty";
        return;
      }
      if (value && prop == "hostname" && !/^\w/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Name must start with a letter or number";
        return;
      }
      if (prop == "vmid" && !/\d/.test(value)) {
        this.rules[prop].error = true;
        this.rules[prop].message = "VM ID must be numeric";
        return;
      }
      if (prop == "vmid" && value < this.nextid) {
        this.rules[prop].error = true;
        this.rules[prop].message = "VM ID cannot be less than initial value";
        return;
      }
      if (prop === "vPsw" && value) {
        if (value !== this.password) {
          this.rules[prop].error = true;
          this.rules[prop].message = "Passwords do not match!";
          return;
        }
      }
      if (prop === "name") {
        if (/[\u4e00-\u9fa5]/.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "Name cannot contain Chinese characters!";
          return;
        }
      }
      if (value && prop === "ip") {
        if (!IP4_cidr_match.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "Invalid IPv4/CIDR format!";
          return;
        }
      }
      if (value && prop === "ip6") {
        if (!IP6_cidr_match.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "Invalid IPv6/CIDR format! Example: 2001:DB8::42/64";
          return;
        }
      }
      if (value && prop === "gw") {
        if (!IP4_match.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "Invalid gateway format! Example: 10.10.10.1";
          return;
        }
      }
      if (value && prop === "gw6") {
        if (!IP6_match.test(value)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "Invalid gateway format!";
          return;
        }
      }
      if (value && prop === "hwaddr") {
        if (
          !/[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}/.test(
            value
          )
        ) {
          this.rules[prop].error = true;
          this.rules[prop].message = "Invalid MAC address format!";
          return;
        }
      }
      if (
        value &&
        prop === "nameserver" &&
        !/^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(
          value
        )
      ) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Invalid format!";
        return;
      }
      if (prop === "cpuunits" && value && Number(value) < 8) {
        this.rules[prop].error = true;
        this.rules[prop].message = "Value cannot be less than 8";
        return;
      }
      if (value && prop === "ssh") {
        if (!parseSSHKey(this.ssh)) {
          this.rules[prop].error = true;
          this.rules[prop].message = "Invalid public key format!";
          return;
        }
      }
    },
    handleStepChange() { },
    __init__() {
      Promise.all([
        this.queryNodeList(),
        this.queryPoolList(),
        this.queryNextVmId(),
      ]).then(() => {
        this.templateRadio = this.nodeList && this.nodeList[0].id;
        this.nodename = this.nodeList && this.nodeList[0].node;
      });
    },
    // Select storage
    handleStorageSingleList(val) {
      this.storageRadio = val.storage;
      this.queryIsoList({ storage: this.storageRadio, content: "iso" }).then(
        (res) => {
          this.isoRadio = this.isoList.length > 0 ? this.isoList[0].volid : "";
        }
      );
    },
    // Select image storage
    handleImageStorageChange(val) {
      this.imageStorageRadio = val;
      this.storageType = this.imageStorageList.filter(
        (it) => it.storage === val
      )[0].type;
      if (this.storageType === "dir") this.format = "qcow2";
      else this.format = "raw";
    },
    // Select storage and request template list
    handleStorageSelect(val) {
      this.storage = val;
      this.queryIsoList({ storage: this.storage, content: "vztmpl" }).then(
        (res) => {
          this.tmpl =
            this.isoList.length > 0
              ? this.isoList[0].volid.replace(/([\s\S]*)\/([\s\S]*)$/, "$2")
              : "";
        }
      );
    },
    isQuota() { },
    handleTabChange(value) {
      this.tab = value;
    },
  },
  // Cancel timer task before page destruction
  beforeDestroy() {
    if (this.interVal) {
      clearInterval(this.interVal);
      this.interVal = null;
    }
  },
  watch: {
    visible: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        return newVal;
      }
    },
    $route: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.close();
      }
    },
  },
};
</script>

<style scoped lang="less">
.vm-cpu__flag {
  /deep/.el-table__body {
    font-size: 12px;
  }
}

.cpu-check {
  width: 100%;
  white-space: nowrap;
}

.cpu-label {
  width: 55px;
  display: inline-block;
}

.m-form__section {
  dl {
    width: 964px;
  }
}
</style>
