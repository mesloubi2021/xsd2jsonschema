/**
 *  Basic Xsd2JsonSchema usage sample.
 */

'use strict';

const Xsd2JsonSchema = require('xsd2jsonschema').Xsd2JsonSchema;
const Ajv = require('ajv');

const ajv = new Ajv({
  allErrors: true,
  verbose: false,
});

const xs2js = new Xsd2JsonSchema();
const xsdSchemas = {
  'BaseTypes.xsd': `
					<?xml version="1.0" encoding="UTF-8"?>
					<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns="https://someurl.data" 
					targetNamespace="https://someurl.data"
					 elementFormDefault="qualified" attributeFormDefault="unqualified" version="1.0.0">
						<!--Character-->
						<xs:simpleType name="C">
							<xs:restriction base="xs:string">
								<xs:minLength value="1"/>
							</xs:restriction>
						</xs:simpleType>
						<!--Boolean-->
						<xs:simpleType name="Boolean">
							<xs:restriction base="xs:boolean"/>
						</xs:simpleType>
						<!--Year, YrMon, Date, Time, DateTime, Timestamp-->
						<xs:simpleType name="Year">
							<xs:restriction base="xs:gYear"/>
						</xs:simpleType>
						<xs:simpleType name="YrMon">
							<xs:restriction base="xs:gYearMonth"/>
						</xs:simpleType>
						<xs:simpleType name="Date">
							<xs:restriction base="xs:date"/>
						</xs:simpleType>
						<xs:simpleType name="Time">
							<xs:restriction base="xs:time"/>
						</xs:simpleType>
						<xs:simpleType name="DateTime">
							<xs:restriction base="xs:dateTime"/>
						</xs:simpleType>
						<xs:simpleType name="Timestamp">
							<xs:restriction base="xs:dateTime"/>
						</xs:simpleType>
						<!--Integer-->
						<xs:simpleType name="Integer">
							<xs:restriction base="xs:integer"/>
						</xs:simpleType>
						<!--Universal Resource Identifier (URI)-->
						<xs:simpleType name="URI">
							<xs:restriction base="xs:anyURI">
								<xs:minLength value="1"/>
							</xs:restriction>
						</xs:simpleType>
						<!--Binary-->
						<xs:simpleType name="Binary">
							<xs:restriction base="xs:base64Binary"/>
						</xs:simpleType>
						<xs:simpleType name="Duration">
							<xs:restriction base="xs:duration"/>
						</xs:simpleType>
						<xs:simpleType name="Char_20">
							<xs:restriction base="C">
								<xs:minLength value="1"/>
								<xs:maxLength value="20"/>
							</xs:restriction>
						</xs:simpleType>
					</xs:schema>`,
  'ExampleTypes.xsd': `
						<?xml version="1.0" encoding="UTF-8"?>
						<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" 
						xmlns="http://www.xsd2jsonschema.org/example"
						
						 targetNamespace="http://www.xsd2jsonschema.org/example" elementFormDefault="qualified" attributeFormDefault="unqualified" version="1.0.0">
							<xs:import namespace="https://someurl.data"/>
							<xs:complexType name="PersonInfoType">
								<xs:sequence>
									<xs:element name="PersonName" type="q1:PersonNameType" xmlns:q1="https://someurl.data" />
									<xs:element name="Age" type="Integer" minOccurs="0"/>
									<xs:element name="BirthDate" type="Date"/>
								</xs:sequence>
							</xs:complexType>
							<xs:complexType name="PersonNameType">
								<xs:sequence>
									<xs:element name="FirstName" type="Char_20"/>
									<xs:element name="MiddleName" type="Char_20" minOccurs="0"/>
									<xs:element name="LastName" type="Char_20"/>
									<xs:element name="AliasName" type="Char_20" minOccurs="0" maxOccurs="unbounded"/>
								</xs:sequence>
							</xs:complexType>
						</xs:schema>`,
};

// First, convert the XML Schema's into JSON Schema
let jsonSchemas = xs2js.processAllSchemas({
  schemas: xsdSchemas,
});

// Then use the converted schemas to validate JSON instances
ajv.addSchema([
  jsonSchemas['BaseTypes.xsd'].getJsonSchema(),
  jsonSchemas['ExampleTypes.xsd'].getJsonSchema(),
]);

const validate = ajv.getSchema(jsonSchemas['ExampleTypes.xsd'].filename);
var valid = false;

// PersonInfo
const examplePersonInfo = {
  PersonInfoType: {
    PersonName: {
      FirstName: 'Carrie',
      MiddleName: 'B',
      LastName: 'Brown',
    },
    Age: 19,
    BirthDate: '2000-01-01',
  },
};
valid = validate(examplePersonInfo);
if (valid) {
  console.log('examplePersonInfo is VALID!');
} else {
  console.log(
    'examplePersonInfo is INVALID\n' +
      JSON.stringify(validate.errors, null, '\t') +
      '\n'
  );
}

// PersonName
const examplePersonName = {
  PersonNameType: {
    FirstName: 'Kevin',
    MiddleName: 'J',
    LastName: 'Darley',
  },
};
valid = validate(examplePersonName);
if (valid) {
  console.log('examplePersonName is VALID!');
} else {
  console.log(
    'examplePersonName is INVALID\n' +
      JSON.stringify(validate.errors, null, '\t') +
      '\n'
  );
}

// PersonName
const errorPersonName = {
  PersonNameType: {
    errorName: 'Kevin',
    MiddleName: 'J',
    LastName: 'Darley',
  },
};
valid = validate(errorPersonName);
if (valid) {
  console.log('errorPersonName is VALID but should be INVALID!');
} else {
  console.log(
    'errorPersonName is INVALID as expected\n' +
      JSON.stringify(validate.errors, null, '\t') +
      '\n'
  );
}
