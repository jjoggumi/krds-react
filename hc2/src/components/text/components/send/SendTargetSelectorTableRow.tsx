import { CheckBox } from '@/components/uiux';

import { CONTACT_LABELS, phoneNumberFields } from '@/components/text/constants';
import { isEmpty } from '@/utils/validate';
import { Contact } from '@/components/text/types';

interface SendTargetSelectorTableRowProps {
  contact: Contact;
  selectedIds: string[];
  isShowCheckbox: boolean;
  isRowChecked: boolean;
  onChangeRowCheckbox: (contact: Contact, isChecked: boolean) => void;
  onChangeCellCheckbox: (contactId: string, isChecked: boolean) => void;
}

export const SendTargetSelectorTableRow = ({ contact, selectedIds, isShowCheckbox, isRowChecked, onChangeRowCheckbox, onChangeCellCheckbox }: SendTargetSelectorTableRowProps) => {
  const handleChangeRowCheckbox = (isChecked: boolean) => {
    onChangeRowCheckbox(contact, isChecked);
  };

  const handleCheckCell = (fieldName: string, isChecked: boolean) => {
    onChangeCellCheckbox(contact[fieldName], isChecked);
  }

  return (
    <tr>
      <td>
        {isShowCheckbox && <CheckBox checked={isRowChecked} onChange={handleChangeRowCheckbox} className="align-middle" />}
      </td>

      {Object.keys(CONTACT_LABELS).map((key: string) => {
        let isCellChecked = false;
        if (phoneNumberFields.includes(key)) {
          const contactIdKey = getContactIdKeyByPhoneFieldName(key);
          isCellChecked = selectedIds.includes(contact[contactIdKey]);
        }

        return (
          <td key={`${contact.contactId}-cell-${key}`} className={phoneNumberFields.includes(key) && !isEmpty(contact[key]) ? '!text-left' : ''}>
            <ContactTableCell
              initValue={contact[key]}
              fieldName={key}
              isCellChecked={isCellChecked}
              onCheckCell={handleCheckCell}
            />
          </td>
        );
      })}
    </tr>
  );
};

interface ContactTableCellProps {
  initValue: string | null;
  fieldName: string;
  isCellChecked: boolean;
  onCheckCell: (idFieldName: string, isChecked: boolean) => void;
}

const ContactTableCell = ({ initValue, fieldName, isCellChecked, onCheckCell }: ContactTableCellProps) => {
  const isShowCheckBox = phoneNumberFields.includes(fieldName) && !isEmpty(initValue);

  const handleChangeCellCheckbox = (isChecked: boolean) => {
    onCheckCell(getContactIdKeyByPhoneFieldName(fieldName), isChecked)
  };

  return (
    <>
      {isShowCheckBox && <CheckBox checked={isCellChecked} onChange={handleChangeCellCheckbox} className="mr-2" />}
      {initValue}
    </>
  );
};

const getContactIdKeyByPhoneFieldName = (phoneFieldName: string) => {
  return {
    phoneNumber: 'contactId',
    phoneNumberParent1: 'contactParent1Id',
    phoneNumberParent2: 'contactParent2Id',
  }[phoneFieldName];
}