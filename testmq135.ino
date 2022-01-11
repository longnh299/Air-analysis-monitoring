


//Include the library
#include <WiFi.h>
#include <PubSubClient.h>
//#include <Arduino_JSON.h>
#include <ArduinoJson.h>
#include <MQUnifiedsensor.h>

const char* ssid= "VIETTEL_NGUYENHONGCHAU";
const char* password= "chau8899";
const char* mqtt_server= "192.168.1.198";
int          mqtt_port=1883;
String JsonData;
WiFiClient espClient;
PubSubClient client(espClient);

//Definitions
#define placa "ESP-32"
#define Voltage_Resolution 5
#define pin A0 //Analog input 0 of your arduino
#define type "MQ-135" //MQ135
#define ADC_Bit_Resolution 10 // For arduino UNO/MEGA/NANO
#define RatioMQ135CleanAir 3.6//RS / R0 = 3.6 ppm  
//#define calibration_button 13 //Pin to calibrate your sensor

//Declare Sensor
MQUnifiedsensor MQ135(placa, Voltage_Resolution, ADC_Bit_Resolution, pin, type);

// connect to wifi
void connect_wifi() {
  WiFi.mode(WIFI_STA); // noi den 1 access point
  WiFi.begin(ssid,password);
  while(WiFi.status()!=WL_CONNECTED){
    delay(500);
    Serial.print("Dang ket noi den wifi ");
    Serial.println(ssid);
    }
    Serial.print("Da ket noi thanh cong den wifi");
    Serial.println(ssid);
}

// check ket noi mqtt broker
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP32ClientX"; // co nhieu client nen dat moi client 1 id
    clientId += String(random(0xffff), HEX);// ghep random 1 id khac nhau 
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // pub topic "ktmt/in"
      client.publish("/ktmt/out","hello");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
void setup() {
  //Init the serial port communication - to debug the library
  Serial.begin(115200); //Init serial port
  connect_wifi();
  client.setServer(mqtt_server,mqtt_port); // connect to mqtt broker
  
  //Set math model to calculate the PPM concentration and the value of constants
  MQ135.setRegressionMethod(1); //_PPM =  a*ratio^b
  
  /*****************************  MQ Init ********************************************/ 
  //Remarks: Configure the pin of arduino as input.
  /************************************************************************************/ 
  MQ135.init(); 
  /* 
    //If the RL value is different from 10K please assign your RL value with the following method:
    MQ135.setRL(10);
  */
  /*****************************  MQ CAlibration ********************************************/ 
  // Explanation: 
  // In this routine the sensor will measure the resistance of the sensor supposing before was pre-heated
  // and now is on clean air (Calibration conditions), and it will setup R0 value.
  // We recomend execute this routine only on setup or on the laboratory and save on the eeprom of your arduino
  // This routine not need to execute to every restart, you can load your R0 if you know the value
  // Acknowledgements: https://jayconsystems.com/blog/understanding-a-gas-sensor
  Serial.print("Calibrating please wait.");
  float calcR0 = 0;
  for(int i = 1; i<=10; i ++)
  {
    MQ135.update(); // Update data, the arduino will be read the voltage on the analog pin
    calcR0 += MQ135.calibrate(RatioMQ135CleanAir);
    Serial.print(".");
  }
  MQ135.setR0(calcR0/10);
  Serial.println("  done!.");
  
  if(isinf(calcR0)) {Serial.println("Warning: Conection issue founded, R0 is infite (Open circuit detected) please check your wiring and supply"); while(1);}
  if(calcR0 == 0){Serial.println("Warning: Conection issue founded, R0 is zero (Analog pin with short circuit to ground) please check your wiring and supply"); while(1);}
  /*****************************  MQ CAlibration ********************************************/ 
  Serial.println("** Lectures from MQ-135 ****");
  Serial.println("|    CO   |  Alcohol |   CO2  |  Tolueno  |  NH4  |  Acteona  |");  
}

void loop() {
 // put your main code here, to run repeatedly:
  if(!client.connected()) {
    reconnect();
    }
  client.loop();
  
  MQ135.update(); // Update data, the arduino will be read the voltage on the analog pin

  MQ135.setA(605.18); MQ135.setB(-3.937); // Configurate the ecuation values to get CO concentration
  float CO = MQ135.readSensor(); // Sensor will read PPM concentration using the model and a and b values setted before or in the setup

  MQ135.setA(77.255); MQ135.setB(-3.18); // Configurate the ecuation values to get Alcohol concentration
  float Alcohol = MQ135.readSensor(); // Sensor will read PPM concentration using the model and a and b values setted before or in the setup

  MQ135.setA(110.47); MQ135.setB(-2.862); // Configurate the ecuation values to get CO2 concentration
  float CO2 = MQ135.readSensor(); // Sensor will read PPM concentration using the model and a and b values setted before or in the setup

  MQ135.setA(44.947); MQ135.setB(-3.445); // Configurate the ecuation values to get Tolueno concentration
  float Tolueno = MQ135.readSensor(); // Sensor will read PPM concentration using the model and a and b values setted before or in the setup

  MQ135.setA(102.2 ); MQ135.setB(-2.473); // Configurate the ecuation values to get NH4 concentration
  float NH4 = MQ135.readSensor(); // Sensor will read PPM concentration using the model and a and b values setted before or in the setup

  MQ135.setA(34.668); MQ135.setB(-3.369); // Configurate the ecuation values to get Acetona concentration
  float Acetona = MQ135.readSensor(); // Sensor will read PPM concentration using the model and a and b values setted before or in the setup

 // Serial.print("|   "); Serial.print(CO); 
  //Serial.print("   |   "); Serial.print(Alcohol);
  // Note: 200 Offset for CO2 source: https://github.com/miguel5612/MQSensorsLib/issues/29
  /*
  Motivation:
  We have added 200 PPM because when the library is calibrated it assumes the current state of the
  air as 0 PPM, and it is considered today that the CO2 present in the atmosphere is around 400 PPM.
  https://www.lavanguardia.com/natural/20190514/462242832581/concentracion-dioxido-cabono-co2-atmosfera-bate-record-historia-humanidad.html
  */
 // Serial.print("   |   "); Serial.print(CO2 + 400); 
  //Serial.print("   |   "); Serial.print(Tolueno); 
  //Serial.print("   |   "); Serial.print(NH4); 
  //Serial.print("   |   "); Serial.print(Acetona);
  //Serial.println("   |"); 
  /*
    Exponential regression:
  GAS      | a      | b
  CO       | 605.18 | -3.937  
  Alcohol  | 77.255 | -3.18 
  CO2      | 110.47 | -2.862
  Tolueno  | 44.947 | -3.445
  NH4      | 102.2  | -2.473
  Acetona  | 34.668 | -3.369
  */
  // dong goi json
  JsonData="";
  JsonData="{\"CO\":\"" + String(CO)+ "\"," +
            "\"Alcohol\":\"" + String(Alcohol) + "\"," +
            "\"CO2\":\"" + String(CO2+400) + "\"," +
            "\"Tolueno\":\"" + String(Tolueno) + "\"," +
            "\"NH4\":\"" + String(NH4) + "\"," +
            "\"Acetona\":\"" + String(Acetona) + "\"}";
   //Serial.println(JsonData);
   StaticJsonDocument<200> doc;
   deserializeJson(doc,JsonData);
   JsonObject obj=doc.as<JsonObject>();
   serializeJsonPretty(doc,Serial);
   Serial.println();
   char buffer[200];
serializeJson(doc, buffer);
client.publish("/ktmt/out", buffer);
   
   
  
  //client.publish("/ktmt/out",);
  delay(2000); //Sampling frequency
}
// hello test git 
