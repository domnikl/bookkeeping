import mqtt from 'mqtt';
export const client = mqtt.connect('mqtt://homelab');
