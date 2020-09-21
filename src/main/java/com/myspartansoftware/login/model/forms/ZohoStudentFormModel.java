package com.myspartansoftware.login.model.forms;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class ZohoStudentFormModel extends BasicAuthentificationModel {

	private Long id;
	private String childFirstName;
	private String childLastName;
	private String grade;
	private String teacherName;
	private String dateOfBirth;
	private String sex;
	private String allergies;
	private String childStreetAddress;
	private String childAddressCity;
	private String childAddressZipCode;
	private String twoChildFirstName;
	private String twoChildLastName;
	private String twoGrade;
	private String twoTeacherName;
	private String twoDateOfBirth;
	private String twoSex;
	private String twoAllergies;
	private String threeChildFirstName;
	private String threeChildLastName;
	private String threeGrade;
	private String threeTeacherName;
	private String threeDateOfBirth;
	private String threeSex;
	private String threeAllergies;
	private String fourChildFirstName;
	private String fourChildLastName;
	private String fourGrade;
	private String fourTeacherName;
	private String fourDateOfBirth;
	private String fourSex;
	private String fourAllergies;
	private String fiveChildFirstName;
	private String fiveChildLastName;
	private String fiveGrade;
	private String fiveTeacherName;
	private String fiveDateOfBirth;
	private String fiveSex;
	private String fiveAllergies;
	private String location;
	
	private String oneParentFirstName;
	private String oneParentLastName;
	private String parentStreetAddress;
	private String parentCity;
	private String parentZipCode;
	private String email;
	private String driverLicenseNumber;
	private String cellPhone;
	private String workPhone;
	private String twoParentFirstName;
	private String twoParentLastName;
	private String twoParentStreetAddress;
	private String twoParentCity;
	private String twoParentZipCode;
	private String twoEmail;
	private String twoDriverLicenseNumber;
	private String twoCellPhone;
	private String twoWorkPhone;
	private String additionalPickUpNameFirst;
	private String additionalPickUpNameLast;
	private String additionalPickUpPhone;
	private String twoAdditionalPickUpNameFirst;
	private String twoAdditionalPickUpNameLast;
	private String twoAdditionalPickUpPhone;
	private String threeAdditionalPickUpNameFirst;
	private String threeAdditionalPickUpNameLast;
	private String threeAdditionalPickUpPhone;
	private String[] noPhoto;
	private String[] enrollmentType;
	private String school;
	private String parentOneCCPS;
	private String parentTwoCCPS;
}
