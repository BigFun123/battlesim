import * as GUI from '@babylonjs/gui';
import { CGUI } from './CGUI';

const cornerRadius = 2;
const DIALOG_BORDER = "gray";
const DIALOG_BG = "rgb(20.6,20.6,20.6,1.0)";
const BUTTON_BG = "rgb(0.6,0.6,0.6,1.0)";

export class GUIHelper {
    static adt;

    static setADT(adt) {
        GUIHelper.adt = adt;
    }

    static createButton(text, width, height, top, left, onClick) {
        let button = GUI.Button.CreateSimpleButton("but", text);
        button.width = width;
        button.height = height;
        button.top = top;
        button.left = left;
        button.color = "white";
        button.background = BUTTON_BG;
        button.onPointerUpObservable.add(onClick);
        return button;
    }

    static createImageButton(image, text, width, height, onClick, bottomText) {
        let button = GUI.Button.CreateImageOnlyButton("but", image);
        button.width = width;
        button.height = height;        
        button.color = "white";
        button.background = BUTTON_BG;
        button.onPointerUpObservable.add(onClick);
        let icon = button.getChildByName("but_icon");
        if (icon) {
            icon.stretch = GUI.Image.STRETCH_UNIFORM;
        }

        let textBlock = new GUI.TextBlock();
        textBlock.text = text;
        textBlock.color = "white";
        textBlock.fontSize = 14;
        textBlock.fontFamily = "Arial";        
        textBlock.fontWeight = "bold";
        textBlock.left = "-3px";
        textBlock.outlineColor = "black";
        textBlock.outlineWidth = 2;
        button.addControl(textBlock);
        textBlock.width = 1;
        textBlock.height = 1;
        if (bottomText) {
            textBlock.top = "-3px";
            textBlock.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            textBlock.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            textBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        } else {
            textBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            textBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        }
        

        return button;
    }

    // create slider
    static createSlider(text, width, height, top, left, min, max, value, onChange) {
        let slider = new GUI.Slider();
        slider.minimum = min;
        slider.maximum = max;
        slider.value = value;
        slider.height = height;
        slider.width = width;
        slider.top = top;
        slider.left = left;
        slider.color = "white";
        slider.background = "green";
        slider.onValueChangedObservable.add(onChange);
        return slider;
    }

    static createDialog(name, width, height, onClose) {      

        let dialog = new GUI.Rectangle(name);
        dialog.width = width;
        dialog.height = height;
        dialog.cornerRadius = cornerRadius;
        dialog.color = DIALOG_BORDER;
        dialog.thickness = 1;
        dialog.background = DIALOG_BG;
        dialog.alpha = 0.9;
        dialog.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        dialog.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        dialog.isVisible = false;
        CGUI.adt.addControl(dialog);


        // create small X to close the dialog
        let x = GUI.Button.CreateSimpleButton("but", "X");
        x.text = "X";
        x.background= BUTTON_BG;
        x.color = "white";
        x.fontSize = 12;
        x.fontFamily = "Arial";
        x.top = 0;
        x.left = 0;
        x.width = "32px";
        x.height ="32px";
        dialog.addControl(x);
        x.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        x.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        
        x.onPointerUpObservable.add(() => {
            dialog.isVisible = false;
            onClose ? onClose() : null;
        });
        


        return dialog;
    }

    static createPopup(adt, text) {
        this.dialog = new GUI.Rectangle();
        this.dialog.width = 0.5;
        this.dialog.height = 0.5;
        this.dialog.cornerRadius = 2;
        this.dialog.color = DIALOG_BORDER;
        this.dialog.thickness = 1;
        this.dialog.background = "black";
        this.dialog.alpha = 0.9;
        this.dialog.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.dialog.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        CGUI.adt.addControl(this.dialog);
        this.dialog.isVisible = true;

        this.dialogText = new GUI.TextBlock();
        this.dialogText.text = text;
        this.dialogText.color = "white";
        this.dialogText.fontSize = 14;
        this.dialogText.fontFamily = "Arial";
        this.dialogText.top = "20px";
        this.dialogText.left = "20px";
        this.dialogText.width = 1;
        this.dialogText.height = 0.8
        this.dialog.addControl(this.dialogText);
        this.dialogText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.dialogText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        this.dialogButton = GUI.Button.CreateSimpleButton("but1", "OK");
        this.dialogButton.width = 0.2;
        this.dialogButton.height = "40px";
        this.dialogButton.color = "white";
        this.dialogButton.fontSize = 14;
        this.dialogButton.background = "grey";
        this.dialogButton.cornerRadius = 1;
        this.dialogButton.thickness = 1;
        this.dialogButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.dialogButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.dialogButton.onPointerUpObservable.add(() => {
            this.dialog.isVisible = false;
        });
        this.dialog.addControl(this.dialogButton);



    }

   
}