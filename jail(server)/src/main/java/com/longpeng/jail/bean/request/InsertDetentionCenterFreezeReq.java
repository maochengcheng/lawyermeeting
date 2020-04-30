package com.longpeng.jail.bean.request;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
@ApiModel(value = "InsertDetentionCenterFreezeReq",description = "冻结派出所请求参数")
public class InsertDetentionCenterFreezeReq {

    @ApiModelProperty(value = "派出所id")
    private Integer id;

    @ApiModelProperty(value = "0-冻结 1-解冻")
    private Integer freeze;

}
