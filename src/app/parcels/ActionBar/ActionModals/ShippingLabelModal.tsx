"use client";

import React, { useState } from "react";
import GeneralActionModal, {
    Heading,
    maxParcelsToShow,
    ActionModalProps,
} from "./GeneralActionModal";
import SelectedParcelsOverview from "../SelectedParcelsOverview";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import ShippingLabelsPdfButton, {
    ShippingLabelError,
} from "@/pdf/ShippingLabels/ShippingLabelsPdfButton";
import { getStatusErrorMessageWithLogId } from "../Statuses";
import { sendAuditLog } from "@/server/auditLog";

interface ShippingLabelsInputProps {
    onLabelQuantityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ShippingLabelsInput: React.FC<ShippingLabelsInputProps> = ({ onLabelQuantityChange }) => {
    return (
        <>
            <Heading>Shipping Labels</Heading>
            <FreeFormTextInput type="number" onChange={onLabelQuantityChange} label="Quantity" />
        </>
    );
};

const getPdfErrorMessage = (error: ShippingLabelError): string => {
    let errorMessage: string;
    switch (error.type) {
        case "parcelFetchFailed":
            errorMessage = "Failed to fetch selected parcel data.";
            break;
        case "noMatchingClient":
            errorMessage = "No client in the database matches that of the selected parcel.";
            break;
        case "noMatchingPackingSlot":
            errorMessage = "No packing slot in the database matches that of the selected parcel.";
            break;
        case "noMatchingCollectionCentre":
            errorMessage =
                "No collection centre in the database matches that of the selected parcel.";
            break;
    }
    return `${errorMessage} LogId: ${error.logId}`;
};

const ShippingLabelModal: React.FC<ActionModalProps> = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [labelQuantity, setLabelQuantity] = useState<number>(0);

    const onLabelQuantityChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setLabelQuantity(parseInt(event.target.value, 10) ?? 0);
    };

    const isInputValid = labelQuantity > 0;

    const onClose = (): void => {
        props.onClose();
        setLabelQuantity(0);
        setErrorMessage(null);
    };

    const onPdfCreationCompleted = async (): Promise<void> => {
        const { error } = await props.updateParcelStatuses(
            props.selectedParcels,
            props.newStatus,
            labelQuantity.toString()
        );
        if (error) {
            setErrorMessage(getStatusErrorMessageWithLogId(error));
        }
        setSuccessMessage("Shipping Labels Created");
        setActionCompleted(true);
        void sendAuditLog({
            action: "create shipping label pdf",
            wasSuccess: true,
            content: {
                parcelIds: props.selectedParcels.map((parcel) => parcel.parcelId),
                labelQuantity: labelQuantity,
            },
        });
    };

    const onPdfCreationFailed = (pdfError: ShippingLabelError): void => {
        setErrorMessage(getPdfErrorMessage(pdfError));
        setActionCompleted(true);
        void sendAuditLog({
            action: "create shipping label pdf",
            wasSuccess: false,
            content: {
                parcelIds: props.selectedParcels.map((parcel) => parcel.parcelId),
                labelQuantity: labelQuantity,
            },
            logId: pdfError.logId,
        });
    };

    return (
        <GeneralActionModal
            {...props}
            onClose={onClose}
            errorMessage={errorMessage}
            successMessage={successMessage}
            actionShown={!actionCompleted}
            actionButton={
                <ShippingLabelsPdfButton
                    disabled={!isInputValid}
                    parcel={props.selectedParcels[0]}
                    labelQuantity={labelQuantity}
                    onPdfCreationCompleted={onPdfCreationCompleted}
                    onPdfCreationFailed={onPdfCreationFailed}
                />
            }
            contentAboveButton={
                <>
                    <ShippingLabelsInput onLabelQuantityChange={onLabelQuantityChange} />
                    <SelectedParcelsOverview
                        parcels={props.selectedParcels}
                        maxParcelsToShow={maxParcelsToShow}
                    />
                </>
            }
        />
    );
};

export default ShippingLabelModal;