import { gettext } from '@src/i18n/local_zhCN.js'
const VGALIST = [
	{
		label: 'Default',
		value: ''
	},
	{
		label: 'Standard VGA',
		value: 'sta'
	},
	{
		label: 'VMware compatible',
		value: 'vmware'
	},
	{
		label: 'SPICE',
		value: 'qxl'
	},
	{
		label: 'SPICE dual monitor',
		value: 'qxl2'
	},
	{
		label: 'SPICE three monitors',
		value: 'qxl3'
	},
	{
		label: 'SPICE four monitors',
		value: 'qxl4'
	},
	{
		label: 'Serial terminal 0',
		value: 'serial0'
	},
	{
		label: 'Serial terminal 1',
		value: 'serial1'
	},
	{
		label: 'Serial terminal 2',
		value: 'serial2'
	},
	{
		label: 'Serial terminal 3',
		value: 'serial3'
	},
	{
		label: 'VirtIO-GPU',
		value: 'virtio'
	},
	{
		label: 'none (none)',
		value: 'none'
	}
]
const BIOSLIST = [
	{
		label: 'Default (SeaBIOS)',
		value: 'seabios'
	},
	{
		label: 'SeaBIOS',
		value: 'seabios'
	},
	{
		label: 'SeaBIOS',
		value: 'seabios'
	},
	{
		label: 'OVMF (UEFI)',
		value: 'ovmf'
	}
]

const SCSIHWLIST = [
	{
		label: 'Default (LSI 53C895A)',
		value: 'lsi'
	},
	{
		label: 'LSI 53C895A',
		value: 'lsi'
	},
	{
		label: 'LSI 53C810',
		value: 'lsi53c810'
	},
	{
		label: 'MegaRAID SAS 8708EM2',
		value: 'megasas'
	},
	{
		label: 'VirtIO SCSI',
		value: 'virtio-scsi-pci'
	},
	{
		label: 'VirtIO SCSI single',
		value: 'virtio-scsi-single'
	},
	{
		label: 'VMware PVSCSI',
		value: 'pvscsi'
	}
]

const MACHINELIST = [
	{
		label: 'Default (i440fx)',
		value: ''
	},
	{
		label: 'q35',
		value: 'q35'
	}
]

const DEVICELIST = [
	{
		label: 'IDE',
		value: 'ide'
	},
	{
		label: 'SATA',
		value: 'sata'
	},
	{
		label: 'virtio',
		value: 'virtio'
	},
	{
		label: 'SCSI',
		value: 'scsi'
	}
]

const CACHELIST = [
	{
		label: 'Default (No cache)',
		value: ''
	},
	{
		label: 'Direct sync',
		value: 'directsync'
	},
	{
		label: 'Write through',
		value: 'writethrough'
	},
	{
		label: 'Write back',
		value: 'writeback'
	},
	{
		label: 'Write back (unsafe)',
		value: 'unsafe'
	},
	{
		label: 'No cache',
		value: 'none'
	}
]

const CPULIST = [
	{
		label: 'athlon',
		value: 'athlon',
		vendor: 'AMD'
	},
	{
		label: 'phenom',
		value: 'phenom',
		vendor: 'AMD'
	},
	{
		label: 'Opteron_G1',
		value: 'Opteron_G1',
		vendor: 'AMD'
	},
	{
		label: 'Opteron_G2',
		value: 'Opteron_G2',
		vendor: 'AMD'
	},
	{
		label: 'Opteron_G3',
		value: 'Opteron_G3',
		vendor: 'AMD'
	},
	{
		label: 'Opteron_G4',
		value: 'Opteron_G4',
		vendor: 'AMD'
	},
	{
		label: 'Opteron_G5',
		value: 'Opteron_G5',
		vendor: 'AMD'
	},
	{
		label: 'EPYC',
		value: 'EPYC',
		vendor: 'AMD'
	},
	{
		label: '486',
		value: '486',
		vendor: 'Intel'
	},
	{
		label: 'core2duo',
		value: 'core2duo',
		vendor: 'Intel'
	},
	{
		label: 'coreduo',
		value: 'coreduo',
		vendor: 'Intel'
	},
	{
		label: 'pentium',
		value: 'pentium',
		vendor: 'Intel'
	},
	{
		label: 'pentium2',
		value: 'pentium2',
		vendor: 'Intel'
	},
	{
		label: 'pentium3',
		value: 'pentium3',
		vendor: 'Intel'
	},
	{
		label: 'Conroe',
		value: 'Conroe',
		vendor: 'Intel'
	},
	{
		label: 'Penryn',
		value: 'Penryn',
		vendor: 'Intel'
	},
	{
		label: 'Nehalem',
		value: 'Nehalem',
		vendor: 'Intel'
	},
	{
		label: 'Westmere',
		value: 'Westmere',
		vendor: 'Intel'
	},
	{
		label: 'SandyBridge',
		value: 'SandyBridge',
		vendor: 'Intel'
	},
	{
		label: 'IvyBridge',
		value: 'IvyBridge',
		vendor: 'Intel'
	},
	{
		label: 'Haswell',
		value: 'Haswell',
		vendor: 'Intel'
	},
	{
		label: 'Haswell-noTSX',
		value: 'Haswell-noTSX',
		vendor: 'Intel'
	},
	{
		label: 'Broadwell',
		value: 'Broadwell',
		vendor: 'Intel'
	},
	{
		label: 'Broadwell-noTSX',
		value: 'Broadwell-noTSX',
		vendor: 'Intel'
	},
	{
		label: 'Skylake-Client',
		value: 'Skylake-Client',
		vendor: 'Intel'
	},
	{
		label: 'Skylake-Server',
		value: 'Skylake-Server',
		vendor: 'Intel'
	},
	{
		label: 'Cascadelake-Server',
		value: 'Cascadelake-Server',
		vendor: 'Intel'
	},
	{
		label: 'KnightsMill',
		value: 'KnightsMill',
		vendor: 'Intel'
	},
	{
		label: 'kvm32',
		value: 'kvm32',
		vendor: 'QEMU'
	},
	{
		label: 'kvm64',
		value: 'kvm64',
		vendor: 'QEMU'
	},
	{
		label: 'qemu32',
		value: 'qemu32',
		vendor: 'QEMU'
	},
	{
		label: 'qemu64',
		value: 'qemu64',
		vendor: 'QEMU'
	},
	{
		label: 'host',
		value: 'host',
		vendor: 'Host'
	}
]

const MODELLIST = [
	{
		label: 'Intel E1000',
		value: 'e1000'
	},
	{
		label: 'VirtIO (paravirtualized)',
		value: 'virtio'
	},
	{
		label: 'Realtek RTL8139',
		value: 'rtl8139'
	},
	{
		label: 'VMware vmxnet3',
		value: 'vmxnet3'
	}
]

const KVM_KEYMAPS = {
	'__default__': 'Default',
	//ar: 'Arabic',
	da: 'Danish',
	de: 'German',
	'de-ch': 'German (Swiss)',
	'en-gb': 'English (UK)',
	'en-us': 'English (USA)',
	es: 'Spanish',
	//et: 'Estonia',
	fi: 'Finnish',
	//fo: 'Faroe Islands',
	fr: 'French',
	'fr-be': 'French (Belgium)',
	'fr-ca': 'French (Canada)',
	'fr-ch': 'French (Swiss)',
	//hr: 'Croatia',
	hu: 'Hungarian',
	is: 'Icelandic',
	it: 'Italian',
	ja: 'Japanese',
	lt: 'Lithuanian',
	//lv: 'Latvian',
	mk: 'Macedonian',
	nl: 'Dutch',
	//'nl-be': 'Dutch (Belgium)',
	no: 'Norwegian',
	pl: 'Polish',
	pt: 'Portuguese',
	'pt-br': 'Portuguese (Brazil)',
	//ru: 'Russian',
	sl: 'Slovenian',
	sv: 'Swedish',
	//th: 'Thai',
	tr: 'Turkish'
}

const CONSOLE_Map = {
	'__default__': 'Default' + ' (xterm.js)',
	'vv': 'SPICE (remote-viewer)',
	'html5': 'HTML5 (noVNC)',
	'xtermjs': 'xterm.js'
}

const KVM_HA_Map = {
	'__default__': 'Default' + ' (conditional)',
	'freeze': 'freeze',
	'failover': 'failover',
	'conditional': 'conditional'
}

const STORAGESCHEMA = {
	dir: {
		name: 'Directory',
		ipanel: 'DirInputPanel',
		faIcon: 'folder'
	},
	lvm: {
		name: 'LVM',
		ipanel: 'LVMInputPanel',
		faIcon: 'folder'
	},
	lvmthin: {
		name: 'LVM-Thin',
		ipanel: 'LvmThinInputPanel',
		faIcon: 'folder'
	},
	nfs: {
		name: 'NFS',
		ipanel: 'NFSInputPanel',
		faIcon: 'building'
	},
	cifs: {
		name: 'CIFS',
		ipanel: 'CIFSInputPanel',
		faIcon: 'building'
	},
	glusterfs: {
		name: 'GlusterFS',
		ipanel: 'GlusterFsInputPanel',
		faIcon: 'building'
	},
	iscsi: {
		name: 'iSCSI',
		ipanel: 'IScsiInputPanel',
		faIcon: 'building'
	},
	cephfs: {
		name: 'CephFS',
		ipanel: 'CephFSInputPanel',
		faIcon: 'building'
	},
	pvecephfs: {
		name: 'CephFS (PVE)',
		ipanel: 'CephFSInputPanel',
		hideAdd: true,
		faIcon: 'building'
	},
	rbd: {
		name: 'RBD',
		ipanel: 'RBDInputPanel',
		faIcon: 'building'
	},
	pveceph: {
		name: 'RBD (PVE)',
		ipanel: 'RBDInputPanel',
		hideAdd: true,
		faIcon: 'building'
	},
	zfs: {
		name: 'ZFS over iSCSI',
		ipanel: 'ZFSInputPanel',
		faIcon: 'building'
	},
	zfspool: {
		name: 'ZFS',
		ipanel: 'ZFSPoolInputPanel',
		faIcon: 'folder'
	},
	drbd: {
		name: 'DRBD',
		hideAdd: true
	}
}

const PORTOCOLIST = [
	{ p: 'tcp', n: 6, d: 'Transmission Control Protocol' },
	{ p: 'udp', n: 17, d: 'User Datagram Protocol' },
	{ p: 'icmp', n: 1, d: 'Internet Control Message Protocol' },
	{ p: 'igmp', n: 2, d: 'Internet Group Management' },
	{ p: 'ggp', n: 3, d: 'gateway-gateway protocol' },
	{ p: 'ipencap', n: 4, d: 'IP encapsulated in IP' },
	{ p: 'st', n: 5, d: 'ST datagram mode' },
	{ p: 'egp', n: 8, d: 'exterior gateway protocol' },
	{ p: 'igp', n: 9, d: 'any private interior gateway (Cisco)' },
	{ p: 'pup', n: 12, d: 'PARC universal packet protocol' },
	{ p: 'hmp', n: 20, d: 'host monitoring protocol' },
	{ p: 'xns-idp', n: 22, d: 'Xerox NS IDP' },
	{ p: 'rdp', n: 27, d: '"reliable datagram" protocol' },
	{ p: 'iso-tp4', n: 29, d: 'ISO Transport Protocol class 4 [RFC905]' },
	{ p: 'dccp', n: 33, d: 'Datagram Congestion Control Prot. [RFC4340]' },
	{ p: 'xtp', n: 36, d: 'Xpress Transfer Protocol' },
	{ p: 'ddp', n: 37, d: 'Datagram Delivery Protocol' },
	{ p: 'idpr-cmtp', n: 38, d: 'IDPR Control Message Transport' },
	{ p: 'ipv6', n: 41, d: 'Internet Protocol, version 6' },
	{ p: 'ipv6-route', n: 43, d: 'Routing Header for IPv6' },
	{ p: 'ipv6-frag', n: 44, d: 'Fragment Header for IPv6' },
	{ p: 'idrp', n: 45, d: 'Inter-Domain Routing Protocol' },
	{ p: 'rsvp', n: 46, d: 'Reservation Protocol' },
	{ p: 'gre', n: 47, d: 'General Routing Encapsulation' },
	{ p: 'esp', n: 50, d: 'Encap Security Payload [RFC2406]' },
	{ p: 'ah', n: 51, d: 'Authentication Header [RFC2402]' },
	{ p: 'skip', n: 57, d: 'SKIP' },
	{ p: 'ipv6-icmp', n: 58, d: 'ICMP for IPv6' },
	{ p: 'ipv6-nonxt', n: 59, d: 'No Next Header for IPv6' },
	{ p: 'ipv6-opts', n: 60, d: 'Destination Options for IPv6' },
	{ p: 'vmtp', n: 81, d: 'Versatile Message Transport' },
	{ p: 'eigrp', n: 88, d: 'Enhanced Interior Routing Protocol (Cisco)' },
	{ p: 'ospf', n: 89, d: 'Open Shortest Path First IGP' },
	{ p: 'ax.25', n: 93, d: 'AX.25 frames' },
	{ p: 'ipip', n: 94, d: 'IP-within-IP Encapsulation Protocol' },
	{ p: 'etherip', n: 97, d: 'Ethernet-within-IP Encapsulation [RFC3378]' },
	{ p: 'encap', n: 98, d: 'Yet Another IP encapsulation [RFC1241]' },
	{ p: 'pim', n: 103, d: 'Protocol Independent Multicast' },
	{ p: 'ipcomp', n: 108, d: 'IP Payload Compression Protocol' },
	{ p: 'vrrp', n: 112, d: 'Virtual Router Redundancy Protocol [RFC5798]' },
	{ p: 'l2tp', n: 115, d: 'Layer Two Tunneling Protocol [RFC2661]' },
	{ p: 'isis', n: 124, d: 'IS-IS over IPv4' },
	{ p: 'sctp', n: 132, d: 'Stream Control Transmission Protocol' },
	{ p: 'fc', n: 133, d: 'Fibre Channel' },
	{ p: 'mobility-header', n: 135, d: 'Mobility Support for IPv6 [RFC3775]' },
	{ p: 'udplite', n: 136, d: 'UDP-Lite [RFC3828]' },
	{ p: 'mpls-in-ip', n: 137, d: 'MPLS-in-IP [RFC4023]' },
	{ p: 'hip', n: 139, d: 'Host Identity Protocol' },
	{ p: 'shim6', n: 140, d: 'Shim6 Protocol [RFC5533]' },
	{ p: 'wesp', n: 141, d: 'Wrapped Encapsulating Security Payload' },
	{ p: 'rohc', n: 142, d: 'Robust Header Compression' }
]

const network_iface_types = {
	eth: "Network Device",
	bridge: 'Linux Bridge',
	bond: 'Linux Bond',
	vlan: 'Linux VLAN',
	OVSBridge: 'OVS Bridge',
	OVSBond: 'OVS Bond',
	OVSPort: 'OVS Port',
	OVSIntPort: 'OVS IntPort'
}

const bond_mode_gettext_map = {
	'802.3ad': 'LACP (802.3ad)',
	'lacp-balance-slb': 'LACP (balance-slb)',
	'lacp-balance-tcp': 'LACP (balance-tcp)',
}

const timeZone = [
	{
		"label": "Africa/Abidjan",
		"value": "Africa/Abidjan"
	},
	{
		"label": "Africa/Accra",
		"value": "Africa/Accra"
	},
	{
		"label": "Africa/Addis_Ababa",
		"value": "Africa/Addis_Ababa"
	},
	{
		"label": "Africa/Algiers",
		"value": "Africa/Algiers"
	},
	{
		"label": "Africa/Asmara",
		"value": "Africa/Asmara"
	},
	{
		"label": "Africa/Bamako",
		"value": "Africa/Bamako"
	},
	{
		"label": "Africa/Bangui",
		"value": "Africa/Bangui"
	},
	{
		"label": "Africa/Banjul",
		"value": "Africa/Banjul"
	},
	{
		"label": "Africa/Bissau",
		"value": "Africa/Bissau"
	},
	{
		"label": "Africa/Blantyre",
		"value": "Africa/Blantyre"
	},
	{
		"label": "Africa/Brazzaville",
		"value": "Africa/Brazzaville"
	},
	{
		"label": "Africa/Bujumbura",
		"value": "Africa/Bujumbura"
	},
	{
		"label": "Africa/Cairo",
		"value": "Africa/Cairo"
	},
	{
		"label": "Africa/Casablanca",
		"value": "Africa/Casablanca"
	},
	{
		"label": "Africa/Ceuta",
		"value": "Africa/Ceuta"
	},
	{
		"label": "Africa/Conakry",
		"value": "Africa/Conakry"
	},
	{
		"label": "Africa/Dakar",
		"value": "Africa/Dakar"
	},
	{
		"label": "Africa/Dar_es_Salaam",
		"value": "Africa/Dar_es_Salaam"
	},
	{
		"label": "Africa/Djibouti",
		"value": "Africa/Djibouti"
	},
	{
		"label": "Africa/Douala",
		"value": "Africa/Douala"
	},
	{
		"label": "Africa/El_Aaiun",
		"value": "Africa/El_Aaiun"
	},
	{
		"label": "Africa/Freetown",
		"value": "Africa/Freetown"
	},
	{
		"label": "Africa/Gaborone",
		"value": "Africa/Gaborone"
	},
	{
		"label": "Africa/Harare",
		"value": "Africa/Harare"
	},
	{
		"label": "Africa/Johannesburg",
		"value": "Africa/Johannesburg"
	},
	{
		"label": "Africa/Kampala",
		"value": "Africa/Kampala"
	},
	{
		"label": "Africa/Khartoum",
		"value": "Africa/Khartoum"
	},
	{
		"label": "Africa/Kigali",
		"value": "Africa/Kigali"
	},
	{
		"label": "Africa/Kinshasa",
		"value": "Africa/Kinshasa"
	},
	{
		"label": "Africa/Lagos",
		"value": "Africa/Lagos"
	},
	{
		"label": "Africa/Libreville",
		"value": "Africa/Libreville"
	},
	{
		"label": "Africa/Lome",
		"value": "Africa/Lome"
	},
	{
		"label": "Africa/Luanda",
		"value": "Africa/Luanda"
	},
	{
		"label": "Africa/Lubumbashi",
		"value": "Africa/Lubumbashi"
	},
	{
		"label": "Africa/Lusaka",
		"value": "Africa/Lusaka"
	},
	{
		"label": "Africa/Malabo",
		"value": "Africa/Malabo"
	},
	{
		"label": "Africa/Maputo",
		"value": "Africa/Maputo"
	},
	{
		"label": "Africa/Maseru",
		"value": "Africa/Maseru"
	},
	{
		"label": "Africa/Mbabane",
		"value": "Africa/Mbabane"
	},
	{
		"label": "Africa/Mogadishu",
		"value": "Africa/Mogadishu"
	},
	{
		"label": "Africa/Monrovia",
		"value": "Africa/Monrovia"
	},
	{
		"label": "Africa/Nairobi",
		"value": "Africa/Nairobi"
	},
	{
		"label": "Africa/Ndjamena",
		"value": "Africa/Ndjamena"
	},
	{
		"label": "Africa/Niamey",
		"value": "Africa/Niamey"
	},
	{
		"label": "Africa/Nouakchott",
		"value": "Africa/Nouakchott"
	},
	{
		"label": "Africa/Ouagadougou",
		"value": "Africa/Ouagadougou"
	},
	{
		"label": "Africa/Porto-Novo",
		"value": "Africa/Porto-Novo"
	},
	{
		"label": "Africa/Sao_Tome",
		"value": "Africa/Sao_Tome"
	},
	{
		"label": "Africa/Tripoli",
		"value": "Africa/Tripoli"
	},
	{
		"label": "Africa/Tunis",
		"value": "Africa/Tunis"
	},
	{
		"label": "Africa/Windhoek",
		"value": "Africa/Windhoek"
	},
	{
		"label": "America/Adak",
		"value": "America/Adak"
	},
	{
		"label": "America/Anchorage",
		"value": "America/Anchorage"
	},
	{
		"label": "America/Anguilla",
		"value": "America/Anguilla"
	},
	{
		"label": "America/Antigua",
		"value": "America/Antigua"
	},
	{
		"label": "America/Araguaina",
		"value": "America/Araguaina"
	},
	{
		"label": "America/Argentina/Buenos_Aires",
		"value": "America/Argentina/Buenos_Aires"
	},
	{
		"label": "America/Argentina/Catamarca",
		"value": "America/Argentina/Catamarca"
	},
	{
		"label": "America/Argentina/Cordoba",
		"value": "America/Argentina/Cordoba"
	},
	{
		"label": "America/Argentina/Jujuy",
		"value": "America/Argentina/Jujuy"
	},
	{
		"label": "America/Argentina/La_Rioja",
		"value": "America/Argentina/La_Rioja"
	},
	{
		"label": "America/Argentina/Mendoza",
		"value": "America/Argentina/Mendoza"
	},
	{
		"label": "America/Argentina/Rio_Gallegos",
		"value": "America/Argentina/Rio_Gallegos"
	},
	{
		"label": "America/Argentina/Salta",
		"value": "America/Argentina/Salta"
	},
	{
		"label": "America/Argentina/San_Juan",
		"value": "America/Argentina/San_Juan"
	},
	{
		"label": "America/Argentina/San_Luis",
		"value": "America/Argentina/San_Luis"
	},
	{
		"label": "America/Argentina/Tucuman",
		"value": "America/Argentina/Tucuman"
	},
	{
		"label": "America/Argentina/Ushuaia",
		"value": "America/Argentina/Ushuaia"
	},
	{
		"label": "America/Aruba",
		"value": "America/Aruba"
	},
	{
		"label": "America/Asuncion",
		"value": "America/Asuncion"
	},
	{
		"label": "America/Atikokan",
		"value": "America/Atikokan"
	},
	{
		"label": "America/Bahia",
		"value": "America/Bahia"
	},
	{
		"label": "America/Bahia_Banderas",
		"value": "America/Bahia_Banderas"
	},
	{
		"label": "America/Barbados",
		"value": "America/Barbados"
	},
	{
		"label": "America/Belem",
		"value": "America/Belem"
	},
	{
		"label": "America/Belize",
		"value": "America/Belize"
	},
	{
		"label": "America/Blanc-Sablon",
		"value": "America/Blanc-Sablon"
	},
	{
		"label": "America/Boa_Vista",
		"value": "America/Boa_Vista"
	},
	{
		"label": "America/Bogota",
		"value": "America/Bogota"
	},
	{
		"label": "America/Boise",
		"value": "America/Boise"
	},
	{
		"label": "America/Cambridge_Bay",
		"value": "America/Cambridge_Bay"
	},
	{
		"label": "America/Campo_Grande",
		"value": "America/Campo_Grande"
	},
	{
		"label": "America/Cancun",
		"value": "America/Cancun"
	},
	{
		"label": "America/Caracas",
		"value": "America/Caracas"
	},
	{
		"label": "America/Cayenne",
		"value": "America/Cayenne"
	},
	{
		"label": "America/Cayman",
		"value": "America/Cayman"
	},
	{
		"label": "America/Chicago",
		"value": "America/Chicago"
	},
	{
		"label": "America/Chihuahua",
		"value": "America/Chihuahua"
	},
	{
		"label": "America/Costa_Rica",
		"value": "America/Costa_Rica"
	},
	{
		"label": "America/Cuiaba",
		"value": "America/Cuiaba"
	},
	{
		"label": "America/Curacao",
		"value": "America/Curacao"
	},
	{
		"label": "America/Danmarkshavn",
		"value": "America/Danmarkshavn"
	},
	{
		"label": "America/Dawson",
		"value": "America/Dawson"
	},
	{
		"label": "America/Dawson_Creek",
		"value": "America/Dawson_Creek"
	},
	{
		"label": "America/Denver",
		"value": "America/Denver"
	},
	{
		"label": "America/Detroit",
		"value": "America/Detroit"
	},
	{
		"label": "America/Dominica",
		"value": "America/Dominica"
	},
	{
		"label": "America/Edmonton",
		"value": "America/Edmonton"
	},
	{
		"label": "America/Eirunepe",
		"value": "America/Eirunepe"
	},
	{
		"label": "America/El_Salvador",
		"value": "America/El_Salvador"
	},
	{
		"label": "America/Fortaleza",
		"value": "America/Fortaleza"
	},
	{
		"label": "America/Glace_Bay",
		"value": "America/Glace_Bay"
	},
	{
		"label": "America/Godthab",
		"value": "America/Godthab"
	},
	{
		"label": "America/Goose_Bay",
		"value": "America/Goose_Bay"
	},
	{
		"label": "America/Grand_Turk",
		"value": "America/Grand_Turk"
	},
	{
		"label": "America/Grenada",
		"value": "America/Grenada"
	},
	{
		"label": "America/Guadeloupe",
		"value": "America/Guadeloupe"
	},
	{
		"label": "America/Guatemala",
		"value": "America/Guatemala"
	},
	{
		"label": "America/Guayaquil",
		"value": "America/Guayaquil"
	},
	{
		"label": "America/Guyana",
		"value": "America/Guyana"
	},
	{
		"label": "America/Halifax",
		"value": "America/Halifax"
	},
	{
		"label": "America/Havana",
		"value": "America/Havana"
	},
	{
		"label": "America/Hermosillo",
		"value": "America/Hermosillo"
	},
	{
		"label": "America/Indiana/Indianapolis",
		"value": "America/Indiana/Indianapolis"
	},
	{
		"label": "America/Indiana/Knox",
		"value": "America/Indiana/Knox"
	},
	{
		"label": "America/Indiana/Marengo",
		"value": "America/Indiana/Marengo"
	},
	{
		"label": "America/Indiana/Petersburg",
		"value": "America/Indiana/Petersburg"
	},
	{
		"label": "America/Indiana/Tell_City",
		"value": "America/Indiana/Tell_City"
	},
	{
		"label": "America/Indiana/Vevay",
		"value": "America/Indiana/Vevay"
	},
	{
		"label": "America/Indiana/Vincennes",
		"value": "America/Indiana/Vincennes"
	},
	{
		"label": "America/Indiana/Winamac",
		"value": "America/Indiana/Winamac"
	},
	{
		"label": "America/Inuvik",
		"value": "America/Inuvik"
	},
	{
		"label": "America/Iqaluit",
		"value": "America/Iqaluit"
	},
	{
		"label": "America/Jamaica",
		"value": "America/Jamaica"
	},
	{
		"label": "America/Juneau",
		"value": "America/Juneau"
	},
	{
		"label": "America/Kentucky/Louisville",
		"value": "America/Kentucky/Louisville"
	},
	{
		"label": "America/Kentucky/Monticello",
		"value": "America/Kentucky/Monticello"
	},
	{
		"label": "America/La_Paz",
		"value": "America/La_Paz"
	},
	{
		"label": "America/Lima",
		"value": "America/Lima"
	},
	{
		"label": "America/Los_Angeles",
		"value": "America/Los_Angeles"
	},
	{
		"label": "America/Maceio",
		"value": "America/Maceio"
	},
	{
		"label": "America/Managua",
		"value": "America/Managua"
	},
	{
		"label": "America/Manaus",
		"value": "America/Manaus"
	},
	{
		"label": "America/Marigot",
		"value": "America/Marigot"
	},
	{
		"label": "America/Martinique",
		"value": "America/Martinique"
	},
	{
		"label": "America/Matamoros",
		"value": "America/Matamoros"
	},
	{
		"label": "America/Mazatlan",
		"value": "America/Mazatlan"
	},
	{
		"label": "America/Menominee",
		"value": "America/Menominee"
	},
	{
		"label": "America/Merida",
		"value": "America/Merida"
	},
	{
		"label": "America/Mexico_City",
		"value": "America/Mexico_City"
	},
	{
		"label": "America/Miquelon",
		"value": "America/Miquelon"
	},
	{
		"label": "America/Moncton",
		"value": "America/Moncton"
	},
	{
		"label": "America/Monterrey",
		"value": "America/Monterrey"
	},
	{
		"label": "America/Montevideo",
		"value": "America/Montevideo"
	},
	{
		"label": "America/Montreal",
		"value": "America/Montreal"
	},
	{
		"label": "America/Montserrat",
		"value": "America/Montserrat"
	},
	{
		"label": "America/Nassau",
		"value": "America/Nassau"
	},
	{
		"label": "America/New_York",
		"value": "America/New_York"
	},
	{
		"label": "America/Nipigon",
		"value": "America/Nipigon"
	},
	{
		"label": "America/Nome",
		"value": "America/Nome"
	},
	{
		"label": "America/Noronha",
		"value": "America/Noronha"
	},
	{
		"label": "America/North_Dakota/Center",
		"value": "America/North_Dakota/Center"
	},
	{
		"label": "America/North_Dakota/New_Salem",
		"value": "America/North_Dakota/New_Salem"
	},
	{
		"label": "America/Ojinaga",
		"value": "America/Ojinaga"
	},
	{
		"label": "America/Panama",
		"value": "America/Panama"
	},
	{
		"label": "America/Pangnirtung",
		"value": "America/Pangnirtung"
	},
	{
		"label": "America/Paramaribo",
		"value": "America/Paramaribo"
	},
	{
		"label": "America/Phoenix",
		"value": "America/Phoenix"
	},
	{
		"label": "America/Port-au-Prince",
		"value": "America/Port-au-Prince"
	},
	{
		"label": "America/Port_of_Spain",
		"value": "America/Port_of_Spain"
	},
	{
		"label": "America/Porto_Velho",
		"value": "America/Porto_Velho"
	},
	{
		"label": "America/Puerto_Rico",
		"value": "America/Puerto_Rico"
	},
	{
		"label": "America/Rainy_River",
		"value": "America/Rainy_River"
	},
	{
		"label": "America/Rankin_Inlet",
		"value": "America/Rankin_Inlet"
	},
	{
		"label": "America/Recife",
		"value": "America/Recife"
	},
	{
		"label": "America/Regina",
		"value": "America/Regina"
	},
	{
		"label": "America/Resolute",
		"value": "America/Resolute"
	},
	{
		"label": "America/Rio_Branco",
		"value": "America/Rio_Branco"
	},
	{
		"label": "America/Santa_Isabel",
		"value": "America/Santa_Isabel"
	},
	{
		"label": "America/Santarem",
		"value": "America/Santarem"
	},
	{
		"label": "America/Santiago",
		"value": "America/Santiago"
	},
	{
		"label": "America/Santo_Domingo",
		"value": "America/Santo_Domingo"
	},
	{
		"label": "America/Sao_Paulo",
		"value": "America/Sao_Paulo"
	},
	{
		"label": "America/Scoresbysund",
		"value": "America/Scoresbysund"
	},
	{
		"label": "America/Shiprock",
		"value": "America/Shiprock"
	},
	{
		"label": "America/St_Barthelemy",
		"value": "America/St_Barthelemy"
	},
	{
		"label": "America/St_Johns",
		"value": "America/St_Johns"
	},
	{
		"label": "America/St_Kitts",
		"value": "America/St_Kitts"
	},
	{
		"label": "America/St_Lucia",
		"value": "America/St_Lucia"
	},
	{
		"label": "America/St_Thomas",
		"value": "America/St_Thomas"
	},
	{
		"label": "America/St_Vincent",
		"value": "America/St_Vincent"
	},
	{
		"label": "America/Swift_Current",
		"value": "America/Swift_Current"
	},
	{
		"label": "America/Tegucigalpa",
		"value": "America/Tegucigalpa"
	},
	{
		"label": "America/Thule",
		"value": "America/Thule"
	},
	{
		"label": "America/Thunder_Bay",
		"value": "America/Thunder_Bay"
	},
	{
		"label": "America/Tijuana",
		"value": "America/Tijuana"
	},
	{
		"label": "America/Toronto",
		"value": "America/Toronto"
	},
	{
		"label": "America/Tortola",
		"value": "America/Tortola"
	},
	{
		"label": "America/Vancouver",
		"value": "America/Vancouver"
	},
	{
		"label": "America/Whitehorse",
		"value": "America/Whitehorse"
	},
	{
		"label": "America/Winnipeg",
		"value": "America/Winnipeg"
	},
	{
		"label": "America/Yakutat",
		"value": "America/Yakutat"
	},
	{
		"label": "America/Yellowknife",
		"value": "America/Yellowknife"
	},
	{
		"label": "Antarctica/Casey",
		"value": "Antarctica/Casey"
	},
	{
		"label": "Antarctica/Davis",
		"value": "Antarctica/Davis"
	},
	{
		"label": "Antarctica/DumontDUrville",
		"value": "Antarctica/DumontDUrville"
	},
	{
		"label": "Antarctica/Macquarie",
		"value": "Antarctica/Macquarie"
	},
	{
		"label": "Antarctica/Mawson",
		"value": "Antarctica/Mawson"
	},
	{
		"label": "Antarctica/McMurdo",
		"value": "Antarctica/McMurdo"
	},
	{
		"label": "Antarctica/Palmer",
		"value": "Antarctica/Palmer"
	},
	{
		"label": "Antarctica/Rothera",
		"value": "Antarctica/Rothera"
	},
	{
		"label": "Antarctica/South_Pole",
		"value": "Antarctica/South_Pole"
	},
	{
		"label": "Antarctica/Syowa",
		"value": "Antarctica/Syowa"
	},
	{
		"label": "Antarctica/Vostok",
		"value": "Antarctica/Vostok"
	},
	{
		"label": "Arctic/Longyearbyen",
		"value": "Arctic/Longyearbyen"
	},
	{
		"label": "Asia/Aden",
		"value": "Asia/Aden"
	},
	{
		"label": "Asia/Almaty",
		"value": "Asia/Almaty"
	},
	{
		"label": "Asia/Amman",
		"value": "Asia/Amman"
	},
	{
		"label": "Asia/Anadyr",
		"value": "Asia/Anadyr"
	},
	{
		"label": "Asia/Aqtau",
		"value": "Asia/Aqtau"
	},
	{
		"label": "Asia/Aqtobe",
		"value": "Asia/Aqtobe"
	},
	{
		"label": "Asia/Ashgabat",
		"value": "Asia/Ashgabat"
	},
	{
		"label": "Asia/Baghdad",
		"value": "Asia/Baghdad"
	},
	{
		"label": "Asia/Bahrain",
		"value": "Asia/Bahrain"
	},
	{
		"label": "Asia/Baku",
		"value": "Asia/Baku"
	},
	{
		"label": "Asia/Bangkok",
		"value": "Asia/Bangkok"
	},
	{
		"label": "Asia/Beirut",
		"value": "Asia/Beirut"
	},
	{
		"label": "Asia/Bishkek",
		"value": "Asia/Bishkek"
	},
	{
		"label": "Asia/Brunei",
		"value": "Asia/Brunei"
	},
	{
		"label": "Asia/Choibalsan",
		"value": "Asia/Choibalsan"
	},
	{
		"label": "Asia/Chongqing",
		"value": "Asia/Chongqing"
	},
	{
		"label": "Asia/Colombo",
		"value": "Asia/Colombo"
	},
	{
		"label": "Asia/Damascus",
		"value": "Asia/Damascus"
	},
	{
		"label": "Asia/Dhaka",
		"value": "Asia/Dhaka"
	},
	{
		"label": "Asia/Dili",
		"value": "Asia/Dili"
	},
	{
		"label": "Asia/Dubai",
		"value": "Asia/Dubai"
	},
	{
		"label": "Asia/Dushanbe",
		"value": "Asia/Dushanbe"
	},
	{
		"label": "Asia/Gaza",
		"value": "Asia/Gaza"
	},
	{
		"label": "Asia/Harbin",
		"value": "Asia/Harbin"
	},
	{
		"label": "Asia/Ho_Chi_Minh",
		"value": "Asia/Ho_Chi_Minh"
	},
	{
		"label": "Asia/Hong_Kong",
		"value": "Asia/Hong_Kong"
	},
	{
		"label": "Asia/Hovd",
		"value": "Asia/Hovd"
	},
	{
		"label": "Asia/Irkutsk",
		"value": "Asia/Irkutsk"
	},
	{
		"label": "Asia/Jakarta",
		"value": "Asia/Jakarta"
	},
	{
		"label": "Asia/Jayapura",
		"value": "Asia/Jayapura"
	},
	{
		"label": "Asia/Jerusalem",
		"value": "Asia/Jerusalem"
	},
	{
		"label": "Asia/Kabul",
		"value": "Asia/Kabul"
	},
	{
		"label": "Asia/Kamchatka",
		"value": "Asia/Kamchatka"
	},
	{
		"label": "Asia/Karachi",
		"value": "Asia/Karachi"
	},
	{
		"label": "Asia/Kashgar",
		"value": "Asia/Kashgar"
	},
	{
		"label": "Asia/Kathmandu",
		"value": "Asia/Kathmandu"
	},
	{
		"label": "Asia/Kolkata",
		"value": "Asia/Kolkata"
	},
	{
		"label": "Asia/Krasnoyarsk",
		"value": "Asia/Krasnoyarsk"
	},
	{
		"label": "Asia/Kuala_Lumpur",
		"value": "Asia/Kuala_Lumpur"
	},
	{
		"label": "Asia/Kuching",
		"value": "Asia/Kuching"
	},
	{
		"label": "Asia/Kuwait",
		"value": "Asia/Kuwait"
	},
	{
		"label": "Asia/Macau",
		"value": "Asia/Macau"
	},
	{
		"label": "Asia/Magadan",
		"value": "Asia/Magadan"
	},
	{
		"label": "Asia/Makassar",
		"value": "Asia/Makassar"
	},
	{
		"label": "Asia/Manila",
		"value": "Asia/Manila"
	},
	{
		"label": "Asia/Muscat",
		"value": "Asia/Muscat"
	},
	{
		"label": "Asia/Nicosia",
		"value": "Asia/Nicosia"
	},
	{
		"label": "Asia/Novokuznetsk",
		"value": "Asia/Novokuznetsk"
	},
	{
		"label": "Asia/Novosibirsk",
		"value": "Asia/Novosibirsk"
	},
	{
		"label": "Asia/Omsk",
		"value": "Asia/Omsk"
	},
	{
		"label": "Asia/Oral",
		"value": "Asia/Oral"
	},
	{
		"label": "Asia/Phnom_Penh",
		"value": "Asia/Phnom_Penh"
	},
	{
		"label": "Asia/Pontianak",
		"value": "Asia/Pontianak"
	},
	{
		"label": "Asia/Pyongyang",
		"value": "Asia/Pyongyang"
	},
	{
		"label": "Asia/Qatar",
		"value": "Asia/Qatar"
	},
	{
		"label": "Asia/Qyzylorda",
		"value": "Asia/Qyzylorda"
	},
	{
		"label": "Asia/Rangoon",
		"value": "Asia/Rangoon"
	},
	{
		"label": "Asia/Riyadh",
		"value": "Asia/Riyadh"
	},
	{
		"label": "Asia/Sakhalin",
		"value": "Asia/Sakhalin"
	},
	{
		"label": "Asia/Samarkand",
		"value": "Asia/Samarkand"
	},
	{
		"label": "Asia/Seoul",
		"value": "Asia/Seoul"
	},
	{
		"label": "Asia/Shanghai",
		"value": "Asia/Shanghai"
	},
	{
		"label": "Asia/Singapore",
		"value": "Asia/Singapore"
	},
	{
		"label": "Asia/Taipei",
		"value": "Asia/Taipei"
	},
	{
		"label": "Asia/Tashkent",
		"value": "Asia/Tashkent"
	},
	{
		"label": "Asia/Tbilisi",
		"value": "Asia/Tbilisi"
	},
	{
		"label": "Asia/Tehran",
		"value": "Asia/Tehran"
	},
	{
		"label": "Asia/Thimphu",
		"value": "Asia/Thimphu"
	},
	{
		"label": "Asia/Tokyo",
		"value": "Asia/Tokyo"
	},
	{
		"label": "Asia/Ulaanbaatar",
		"value": "Asia/Ulaanbaatar"
	},
	{
		"label": "Asia/Urumqi",
		"value": "Asia/Urumqi"
	},
	{
		"label": "Asia/Vientiane",
		"value": "Asia/Vientiane"
	},
	{
		"label": "Asia/Vladivostok",
		"value": "Asia/Vladivostok"
	},
	{
		"label": "Asia/Yakutsk",
		"value": "Asia/Yakutsk"
	},
	{
		"label": "Asia/Yekaterinburg",
		"value": "Asia/Yekaterinburg"
	},
	{
		"label": "Asia/Yerevan",
		"value": "Asia/Yerevan"
	},
	{
		"label": "Atlantic/Azores",
		"value": "Atlantic/Azores"
	},
	{
		"label": "Atlantic/Bermuda",
		"value": "Atlantic/Bermuda"
	},
	{
		"label": "Atlantic/Canary",
		"value": "Atlantic/Canary"
	},
	{
		"label": "Atlantic/Cape_Verde",
		"value": "Atlantic/Cape_Verde"
	},
	{
		"label": "Atlantic/Faroe",
		"value": "Atlantic/Faroe"
	},
	{
		"label": "Atlantic/Madeira",
		"value": "Atlantic/Madeira"
	},
	{
		"label": "Atlantic/Reykjavik",
		"value": "Atlantic/Reykjavik"
	},
	{
		"label": "Atlantic/South_Georgia",
		"value": "Atlantic/South_Georgia"
	},
	{
		"label": "Atlantic/St_Helena",
		"value": "Atlantic/St_Helena"
	},
	{
		"label": "Atlantic/Stanley",
		"value": "Atlantic/Stanley"
	},
	{
		"label": "Australia/Adelaide",
		"value": "Australia/Adelaide"
	},
	{
		"label": "Australia/Brisbane",
		"value": "Australia/Brisbane"
	},
	{
		"label": "Australia/Broken_Hill",
		"value": "Australia/Broken_Hill"
	},
	{
		"label": "Australia/Currie",
		"value": "Australia/Currie"
	},
	{
		"label": "Australia/Darwin",
		"value": "Australia/Darwin"
	},
	{
		"label": "Australia/Eucla",
		"value": "Australia/Eucla"
	},
	{
		"label": "Australia/Hobart",
		"value": "Australia/Hobart"
	},
	{
		"label": "Australia/Lindeman",
		"value": "Australia/Lindeman"
	},
	{
		"label": "Australia/Lord_Howe",
		"value": "Australia/Lord_Howe"
	},
	{
		"label": "Australia/Melbourne",
		"value": "Australia/Melbourne"
	},
	{
		"label": "Australia/Perth",
		"value": "Australia/Perth"
	},
	{
		"label": "Australia/Sydney",
		"value": "Australia/Sydney"
	},
	{
		"label": "Europe/Amsterdam",
		"value": "Europe/Amsterdam"
	},
	{
		"label": "Europe/Andorra",
		"value": "Europe/Andorra"
	},
	{
		"label": "Europe/Athens",
		"value": "Europe/Athens"
	},
	{
		"label": "Europe/Belgrade",
		"value": "Europe/Belgrade"
	},
	{
		"label": "Europe/Berlin",
		"value": "Europe/Berlin"
	},
	{
		"label": "Europe/Bratislava",
		"value": "Europe/Bratislava"
	},
	{
		"label": "Europe/Brussels",
		"value": "Europe/Brussels"
	},
	{
		"label": "Europe/Bucharest",
		"value": "Europe/Bucharest"
	},
	{
		"label": "Europe/Budapest",
		"value": "Europe/Budapest"
	},
	{
		"label": "Europe/Chisinau",
		"value": "Europe/Chisinau"
	},
	{
		"label": "Europe/Copenhagen",
		"value": "Europe/Copenhagen"
	},
	{
		"label": "Europe/Dublin",
		"value": "Europe/Dublin"
	},
	{
		"label": "Europe/Gibraltar",
		"value": "Europe/Gibraltar"
	},
	{
		"label": "Europe/Guernsey",
		"value": "Europe/Guernsey"
	},
	{
		"label": "Europe/Helsinki",
		"value": "Europe/Helsinki"
	},
	{
		"label": "Europe/Isle_of_Man",
		"value": "Europe/Isle_of_Man"
	},
	{
		"label": "Europe/Istanbul",
		"value": "Europe/Istanbul"
	},
	{
		"label": "Europe/Jersey",
		"value": "Europe/Jersey"
	},
	{
		"label": "Europe/Kaliningrad",
		"value": "Europe/Kaliningrad"
	},
	{
		"label": "Europe/Kiev",
		"value": "Europe/Kiev"
	},
	{
		"label": "Europe/Lisbon",
		"value": "Europe/Lisbon"
	},
	{
		"label": "Europe/Ljubljana",
		"value": "Europe/Ljubljana"
	},
	{
		"label": "Europe/London",
		"value": "Europe/London"
	},
	{
		"label": "Europe/Luxembourg",
		"value": "Europe/Luxembourg"
	},
	{
		"label": "Europe/Madrid",
		"value": "Europe/Madrid"
	},
	{
		"label": "Europe/Malta",
		"value": "Europe/Malta"
	},
	{
		"label": "Europe/Mariehamn",
		"value": "Europe/Mariehamn"
	},
	{
		"label": "Europe/Minsk",
		"value": "Europe/Minsk"
	},
	{
		"label": "Europe/Monaco",
		"value": "Europe/Monaco"
	},
	{
		"label": "Europe/Moscow",
		"value": "Europe/Moscow"
	},
	{
		"label": "Europe/Oslo",
		"value": "Europe/Oslo"
	},
	{
		"label": "Europe/Paris",
		"value": "Europe/Paris"
	},
	{
		"label": "Europe/Podgorica",
		"value": "Europe/Podgorica"
	},
	{
		"label": "Europe/Prague",
		"value": "Europe/Prague"
	},
	{
		"label": "Europe/Riga",
		"value": "Europe/Riga"
	},
	{
		"label": "Europe/Rome",
		"value": "Europe/Rome"
	},
	{
		"label": "Europe/Samara",
		"value": "Europe/Samara"
	},
	{
		"label": "Europe/San_Marino",
		"value": "Europe/San_Marino"
	},
	{
		"label": "Europe/Sarajevo",
		"value": "Europe/Sarajevo"
	},
	{
		"label": "Europe/Simferopol",
		"value": "Europe/Simferopol"
	},
	{
		"label": "Europe/Skopje",
		"value": "Europe/Skopje"
	},
	{
		"label": "Europe/Sofia",
		"value": "Europe/Sofia"
	},
	{
		"label": "Europe/Stockholm",
		"value": "Europe/Stockholm"
	},
	{
		"label": "Europe/Tallinn",
		"value": "Europe/Tallinn"
	},
	{
		"label": "Europe/Tirane",
		"value": "Europe/Tirane"
	},
	{
		"label": "Europe/Uzhgorod",
		"value": "Europe/Uzhgorod"
	},
	{
		"label": "Europe/Vaduz",
		"value": "Europe/Vaduz"
	},
	{
		"label": "Europe/Vatican",
		"value": "Europe/Vatican"
	},
	{
		"label": "Europe/Vienna",
		"value": "Europe/Vienna"
	},
	{
		"label": "Europe/Vilnius",
		"value": "Europe/Vilnius"
	},
	{
		"label": "Europe/Volgograd",
		"value": "Europe/Volgograd"
	},
	{
		"label": "Europe/Warsaw",
		"value": "Europe/Warsaw"
	},
	{
		"label": "Europe/Zagreb",
		"value": "Europe/Zagreb"
	},
	{
		"label": "Europe/Zaporozhye",
		"value": "Europe/Zaporozhye"
	},
	{
		"label": "Europe/Zurich",
		"value": "Europe/Zurich"
	},
	{
		"label": "Indian/Antananarivo",
		"value": "Indian/Antananarivo"
	},
	{
		"label": "Indian/Chagos",
		"value": "Indian/Chagos"
	},
	{
		"label": "Indian/Christmas",
		"value": "Indian/Christmas"
	},
	{
		"label": "Indian/Cocos",
		"value": "Indian/Cocos"
	},
	{
		"label": "Indian/Comoro",
		"value": "Indian/Comoro"
	},
	{
		"label": "Indian/Kerguelen",
		"value": "Indian/Kerguelen"
	},
	{
		"label": "Indian/Mahe",
		"value": "Indian/Mahe"
	},
	{
		"label": "Indian/Maldives",
		"value": "Indian/Maldives"
	},
	{
		"label": "Indian/Mauritius",
		"value": "Indian/Mauritius"
	},
	{
		"label": "Indian/Mayotte",
		"value": "Indian/Mayotte"
	},
	{
		"label": "Indian/Reunion",
		"value": "Indian/Reunion"
	},
	{
		"label": "Pacific/Apia",
		"value": "Pacific/Apia"
	},
	{
		"label": "Pacific/Auckland",
		"value": "Pacific/Auckland"
	},
	{
		"label": "Pacific/Chatham",
		"value": "Pacific/Chatham"
	},
	{
		"label": "Pacific/Chuuk",
		"value": "Pacific/Chuuk"
	},
	{
		"label": "Pacific/Easter",
		"value": "Pacific/Easter"
	},
	{
		"label": "Pacific/Efate",
		"value": "Pacific/Efate"
	},
	{
		"label": "Pacific/Enderbury",
		"value": "Pacific/Enderbury"
	},
	{
		"label": "Pacific/Fakaofo",
		"value": "Pacific/Fakaofo"
	},
	{
		"label": "Pacific/Fiji",
		"value": "Pacific/Fiji"
	},
	{
		"label": "Pacific/Funafuti",
		"value": "Pacific/Funafuti"
	},
	{
		"label": "Pacific/Galapagos",
		"value": "Pacific/Galapagos"
	},
	{
		"label": "Pacific/Gambier",
		"value": "Pacific/Gambier"
	},
	{
		"label": "Pacific/Guadalcanal",
		"value": "Pacific/Guadalcanal"
	},
	{
		"label": "Pacific/Guam",
		"value": "Pacific/Guam"
	},
	{
		"label": "Pacific/Honolulu",
		"value": "Pacific/Honolulu"
	},
	{
		"label": "Pacific/Johnston",
		"value": "Pacific/Johnston"
	},
	{
		"label": "Pacific/Kiritimati",
		"value": "Pacific/Kiritimati"
	},
	{
		"label": "Pacific/Kosrae",
		"value": "Pacific/Kosrae"
	},
	{
		"label": "Pacific/Kwajalein",
		"value": "Pacific/Kwajalein"
	},
	{
		"label": "Pacific/Majuro",
		"value": "Pacific/Majuro"
	},
	{
		"label": "Pacific/Marquesas",
		"value": "Pacific/Marquesas"
	},
	{
		"label": "Pacific/Midway",
		"value": "Pacific/Midway"
	},
	{
		"label": "Pacific/Nauru",
		"value": "Pacific/Nauru"
	},
	{
		"label": "Pacific/Niue",
		"value": "Pacific/Niue"
	},
	{
		"label": "Pacific/Norfolk",
		"value": "Pacific/Norfolk"
	},
	{
		"label": "Pacific/Noumea",
		"value": "Pacific/Noumea"
	},
	{
		"label": "Pacific/Pago_Pago",
		"value": "Pacific/Pago_Pago"
	},
	{
		"label": "Pacific/Palau",
		"value": "Pacific/Palau"
	},
	{
		"label": "Pacific/Pitcairn",
		"value": "Pacific/Pitcairn"
	},
	{
		"label": "Pacific/Pohnpei",
		"value": "Pacific/Pohnpei"
	},
	{
		"label": "Pacific/Port_Moresby",
		"value": "Pacific/Port_Moresby"
	},
	{
		"label": "Pacific/Rarotonga",
		"value": "Pacific/Rarotonga"
	},
	{
		"label": "Pacific/Saipan",
		"value": "Pacific/Saipan"
	},
	{
		"label": "Pacific/Tahiti",
		"value": "Pacific/Tahiti"
	},
	{
		"label": "Pacific/Tarawa",
		"value": "Pacific/Tarawa"
	},
	{
		"label": "Pacific/Tongatapu",
		"value": "Pacific/Tongatapu"
	},
	{
		"label": "Pacific/Wake",
		"value": "Pacific/Wake"
	},
	{
		"label": "Pacific/Wallis",
		"value": "Pacific/Wallis"
	},
	{
		"label": "UTC",
		"value": "UTC"
	}
];
const kvm_vga_drivers = {
	std: gettext('Standard VGA'),
	vmware: gettext('VMware compatible'),
	qxl: 'SPICE',
	qxl2: 'SPICE dual monitor',
	qxl3: 'SPICE three monitors',
	qxl4: 'SPICE four monitors',
	serial0: gettext('Serial terminal') + ' 0',
	serial1: gettext('Serial terminal') + ' 1',
	serial2: gettext('Serial terminal') + ' 2',
	serial3: gettext('Serial terminal') + ' 3',
	virtio: 'VirtIO-GPU',
	none: 'NONE'
}

const VMCPUFlag = [
	// FIXME: let qemu-server host this and autogenerate or get from API call??
	{ flag: 'md-clear', desc: 'Required to let the guest OS know if MDS is mitigated correctly' },
	{ flag: 'pcid', desc: 'Meltdown fix cost reduction on Westmere, Sandy-, and IvyBridge Intel CPUs' },
	{ flag: 'spec-ctrl', desc: 'Allows improved Spectre mitigation with Intel CPUs' },
	{ flag: 'ssbd', desc: 'Protection for "Speculative Store Bypass" for Intel models' },
	{ flag: 'ibpb', desc: 'Allows improved Spectre mitigation with AMD CPUs' },
	{ flag: 'virt-ssbd', desc: 'Basis for "Speculative Store Bypass" protection for AMD models' },
	{ flag: 'amd-ssbd', desc: 'Improves Spectre mitigation performance with AMD CPUs, best used with "virt-ssbd"' },
	{ flag: 'amd-no-ssb', desc: 'Notifies guest OS that host is not vulnerable for Spectre on AMD CPUs' },
	{ flag: 'pdpe1gb', desc: 'Allow guest OS to use 1GB size pages, if host HW supports it' },
	{ flag: 'hv-tlbflush', desc: 'Improve performance in overcommitted Windows guests. May lead to guest bluescreens on old CPUs.' },
	{ flag: 'hv-evmcs', desc: 'Improve performance for nested virtualization. Only supported on Intel CPUs.' },
	{ flag: 'aes', desc: 'Activate AES instruction set for HW acceleration.' }
]

export {
	VGALIST,
	BIOSLIST,
	SCSIHWLIST,
	MACHINELIST,
	DEVICELIST,
	CACHELIST,
	CPULIST,
	MODELLIST,
	KVM_KEYMAPS,
	CONSOLE_Map,
	KVM_HA_Map,
	STORAGESCHEMA,
	PORTOCOLIST,
	network_iface_types,
	bond_mode_gettext_map,
	timeZone,
	kvm_vga_drivers,
	VMCPUFlag
} 