package com.longpeng.jail.bean.request;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
@ApiModel(value = "InsertManagerDetentionCenterReq",description = "冻结派出所请求参数")
public class InsertManagerDetentionCenterReq {

    @ApiModelProperty(value = "管理人id")
    private Integer managerId;

    @ApiModelProperty(value = "派出所id")
    private Integer detentionCenterId;

    @ApiModelProperty(value = "派出所名称")
    private String detentionCenterName;
}
